import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { movieApi, Movie, getImageUrl } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  variant?: 'hero' | 'compact';
}

export const SearchBar = ({ 
  className = '', 
  placeholder = 'Search for movies...',
  variant = 'compact'
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isHero = variant === 'hero';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchMovies = async () => {
      if (query.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      
      // Show timeout message after 8 seconds
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          toast({
            title: "Search Taking Long",
            description: "Search is taking longer than usual. Please wait...",
          });
        }
      }, 8000);

      try {
        const searchResult = await movieApi.searchMovies(query);
        clearTimeout(timeoutId);
        setResults(searchResult.movies.slice(0, 5)); // Show top 5 results
        setShowDropdown(true);
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('Search error:', error);
        
        let errorMessage = "Failed to search movies. Please try again.";
        if (error.message?.includes('timeout')) {
          errorMessage = "Search timed out. Please try again.";
        }
        
        toast({
          title: "Search Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, toast]);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
      setShowDropdown(false);
      setQuery('');
    }
  };

  const handleMovieSelect = (movieId: number) => {
    navigate(`/movie/${movieId}`);
    setShowDropdown(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${isHero ? 'w-6 h-6' : 'w-4 h-4'}`} />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
            if (e.key === 'Escape') {
              clearSearch();
            }
          }}
          className={`${isHero ? 'pl-12 pr-20 py-6 text-lg' : 'pl-10 pr-16'} bg-input border-border focus:ring-ring`}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={() => handleSearch()}
            size={isHero ? "default" : "sm"}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Search Dropdown */}
      {showDropdown && (results.length > 0 || isLoading) && (
        <div className="search-dropdown">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : (
            <>
              {results.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieSelect(movie.id)}
                  className="search-item"
                >
                  <img
                    src={getImageUrl(movie.poster_path, 'w300')}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {movie.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {movie.overview || 'No description available'}
                    </p>
                  </div>
                </div>
              ))}
              
              {query && (
                <div
                  onClick={() => handleSearch()}
                  className="search-item border-t border-border bg-accent/50"
                >
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    View all results for "<strong>{query}</strong>"
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};