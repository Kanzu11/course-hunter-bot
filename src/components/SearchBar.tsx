
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for Udemy courses..."
          className="w-full pl-12 pr-4 py-3 rounded-lg bg-white shadow-sm border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          onChange={(e) => onSearch(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </div>
  );
};

export default SearchBar;
