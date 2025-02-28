
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  
  // Use debounce to avoid making too many API requests
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        onSearch(query);
      }
    }, 800); // Increased to 800ms to reduce API calls frequency

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for courses..."
          className="w-full pl-12 pr-4 py-3 rounded-lg bg-white shadow-sm border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </form>
  );
};

export default SearchBar;
