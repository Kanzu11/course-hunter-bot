
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TelegramUser } from '@/types';

interface CourseRequestFormProps {
  telegramUser: TelegramUser | null;
  onRequestClose: () => void;
}

const CourseRequestForm: React.FC<CourseRequestFormProps> = ({ 
  telegramUser, 
  onRequestClose 
}) => {
  const [courseName, setCourseName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a course name",
        variant: "destructive",
      });
      return;
    }
    
    if (!telegramUser) {
      toast({
        title: "Error",
        description: "Please enter your Telegram username before submitting a request",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const botToken = '7854582992:AAFpvQ1yzCi6PswUnI7dzzJtn0Ik07hY6K4';
      const channelId = '@udemmmmp';
      
      const requestMessage = `
🔍 *NEW COURSE REQUEST*

📚 *Requested Course:* ${courseName}
👤 *Requested By:* @${telegramUser.username}
${additionalInfo ? `📝 *Additional Info:* ${additionalInfo}` : ''}
⏰ *Request Time:* ${new Date().toLocaleString()}

Please review this request and inform the customer if this course becomes available.
`;
      
      const encodedMessage = encodeURIComponent(requestMessage);
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${channelId}&text=${encodedMessage}&parse_mode=Markdown`;
      
      const response = await fetch(telegramUrl);
      const data = await response.json();
      
      if (data.ok) {
        toast({
          title: "Request Submitted",
          description: "Your course request has been sent to our team. We'll notify you if it becomes available.",
          variant: "default",
        });
        onRequestClose();
      } else {
        console.error('Telegram API error:', data);
        throw new Error('Failed to send request notification');
      }
    } catch (error) {
      console.error('Error submitting course request:', error);
      toast({
        title: "Request Failed",
        description: "There was an error submitting your request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-medium mb-4">Request a Course</h3>
      <p className="text-gray-600 mb-4">
        Can't find the course you're looking for? Submit a request and we'll try to add it.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
            Course Name *
          </label>
          <Input
            id="courseName"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Enter the exact course name from Udemy"
            required
          />
        </div>
        
        <div>
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Information (optional)
          </label>
          <Textarea
            id="additionalInfo"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Course URL, instructor name, or any other details that might help us find the course"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button
            type="button"
            variant="outline" 
            onClick={onRequestClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !courseName.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourseRequestForm;
