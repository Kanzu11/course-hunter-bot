
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface CourseProps {
  title: string;
  description: string;
  thumbnail: string;
  price?: number; // Price in USD from Udemy
  rating?: number; // Rating out of 5
  numReviews?: number; // Number of reviews
  instructor?: string; // Course instructor
  onPurchase: () => void;
  isLoading?: boolean;
}

const CourseCard = ({ 
  title, 
  description, 
  thumbnail, 
  price, 
  rating, 
  numReviews, 
  instructor,
  onPurchase, 
  isLoading = false 
}: CourseProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <img
          src={thumbnail}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-2 mb-2">{title}</h3>
        
        {instructor && (
          <p className="text-sm text-gray-500 mb-1">Instructor: {instructor}</p>
        )}
        
        {rating !== undefined && (
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-gray-300"
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            {numReviews && (
              <span className="text-xs text-gray-500">
                ({numReviews.toLocaleString()} reviews)
              </span>
            )}
          </div>
        )}
        
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">{description}</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {price ? (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 line-through">${price.toFixed(2)} USD</span>
                <span className="text-lg font-bold text-primary">300 ETB</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary">300 ETB</span>
            )}
            <Button
              onClick={onPurchase}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-white transition-colors duration-200"
            >
              {isLoading ? 'Processing...' : 'Buy Now'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
