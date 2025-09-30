import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { MoviesGrid } from '@/components/MoviesGrid';
import { movieApi, Movie } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const searchMovies = async () => {
      if (!query) return;

      try {
        setLoading(true);
        const result = await movieApi.searchMovies(query);
        setMovies(result.movies);
      } catch (error) {
        console.error('Search failed:', error);
        toast({
          title: "Search Error",
          description: "Failed to search movies. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    searchMovies();
  }, [query, toast]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Search Results</h1>
          </div>
          {query && (
            <p className="text-xl text-muted-foreground mb-6">
              Results for "<span className="text-foreground font-medium">{query}</span>"
            </p>
          )}
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <MoviesGrid movies={[]} loading={true} />
        ) : movies.length > 0 ? (
          <div>
            <p className="text-muted-foreground mb-6">
              Found {movies.length} result{movies.length !== 1 ? 's' : ''}
            </p>
            <MoviesGrid movies={movies} />
          </div>
        ) : query ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-4">No Results Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              We couldn't find any movies matching "{query}". Try different keywords or check your spelling.
            </p>
            <SearchBar className="max-w-md mx-auto" />
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-semibold mb-4">Search for Movies</h3>
            <p className="text-muted-foreground mb-8">
              Enter a movie title above to start searching
            </p>
          </div>
        )}
      </div>
    </div>
  );
};