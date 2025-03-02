
import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  
  // Using useCallback to memoize the debounce function
  const debouncedSearch = useCallback(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        onSearch(value);
      }, 500); // 500ms debounce
    };
  }, [onSearch]);

  // Initialize the debounced search function
  const debounceSearch = useCallback(debouncedSearch(), [debouncedSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debounceSearch(value);
  };

  // Enhanced handleSubmit to immediately trigger search when user presses Enter
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query); // Immediately trigger search without debounce
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for courses..."
          className="w-full pl-12 pr-24 py-3 rounded-lg bg-white shadow-sm border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          value={query}
          onChange={handleChange}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <button 
          type="submit" 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-md text-sm hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
