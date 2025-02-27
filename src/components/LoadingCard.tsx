
import React from 'react';
import { Card } from '@/components/ui/card';

const LoadingCard = () => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
};

export default LoadingCard;
