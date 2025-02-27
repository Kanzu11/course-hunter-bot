
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CourseProps {
  title: string;
  description: string;
  thumbnail: string;
  price?: number; // Price in USD from Udemy
  onPurchase: () => void;
  isLoading?: boolean;
}

const CourseCard = ({ title, description, thumbnail, price, onPurchase, isLoading = false }: CourseProps) => {
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
