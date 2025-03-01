
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
      }, 500); // Increased to 500ms to reduce frequency of searches
    };
  }, [onSearch]);

  // Initialize the debounced search function
  const debounceSearch = useCallback(debouncedSearch(), [debouncedSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debounceSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for courses..."
          className="w-full pl-12 pr-4 py-3 rounded-lg bg-white shadow-sm border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          value={query}
          onChange={handleChange}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </form>
  );
};

export default SearchBar;
