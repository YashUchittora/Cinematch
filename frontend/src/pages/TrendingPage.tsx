import { useState, useEffect } from 'react';
import { TrendingUp, Flame } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoviesGrid } from '@/components/MoviesGrid';
import { movieApi, Movie } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const TrendingPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await movieApi.getTrending();
        setMovies(data.movies);
        setTvShows(data.tv_shows);
      } catch (error) {
        console.error('Failed to fetch trending content:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load trending content. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [toast]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Trending Now</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            What's hot and trending in entertainment
          </p>
        </div>

        {/* Trending Content Tabs */}
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Movies
            </TabsTrigger>
            <TabsTrigger value="tv" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              TV Shows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <MoviesGrid 
              movies={movies} 
              loading={loading}
              title="Trending Movies"
            />
          </TabsContent>

          <TabsContent value="tv">
            <MoviesGrid 
              movies={tvShows} 
              loading={loading}
              title="Trending TV Shows"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};