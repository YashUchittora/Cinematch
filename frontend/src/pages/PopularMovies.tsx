import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { MoviesGrid } from '@/components/MoviesGrid';
import { movieApi, Movie } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const PopularMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setLoading(true);
        const data = await movieApi.getPopularMovies();
        setMovies(data);
      } catch (error) {
        console.error('Failed to fetch popular movies:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load popular movies. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMovies();
  }, [toast]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Popular Movies</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Discover the most popular movies right now
          </p>
        </div>

        {/* Movies Grid */}
        <MoviesGrid movies={movies} loading={loading} />
      </div>
    </div>
  );
};