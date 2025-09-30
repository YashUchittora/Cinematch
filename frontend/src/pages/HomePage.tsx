import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Flame } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { MoviesGrid } from '@/components/MoviesGrid';
import { RecommendationForm } from '@/components/RecommendationForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { movieApi, Movie } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [popularData, trendingData] = await Promise.all([
          movieApi.getPopularMovies(),
          movieApi.getTrending()
        ]);
        
        setPopularMovies(popularData.slice(0, 12));
        setTrendingMovies(trendingData.movies.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load movies. Please check if the backend is running.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-gradient py-20 lg:py-32">
        <div className="hero-overlay absolute inset-0" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Discover Your Next
              <span className="block bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Favorite Movie
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
              Search thousands of movies, get personalized recommendations, and explore trending content.
            </p>
            
            {/* Hero Search */}
            <div className="max-w-2xl mx-auto mb-12">
              <SearchBar 
                variant="hero" 
                placeholder="Search for any movie..."
                className="w-full"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={showRecommendations} onOpenChange={setShowRecommendations}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Recommendations
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Movie Recommendations</DialogTitle>
                  </DialogHeader>
                  <RecommendationForm onClose={() => setShowRecommendations(false)} />
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="lg"
                className="border-primary/20 hover:bg-primary/10 px-8 py-4 text-lg font-semibold"
                onClick={() => navigate('/trending')}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Browse Trending
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Trending Movies */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Flame className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="loading-shimmer aspect-[2/3] rounded-xl" />
              ))
            ) : (
              trendingMovies.map((movie) => (
                <div key={movie.id} className="movie-card">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
                    alt={movie.title}
                    className="movie-card-poster"
                  />
                  <div className="movie-card-content">
                    <h3 className="movie-card-title">{movie.title}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Popular Movies */}
        <MoviesGrid
          movies={popularMovies}
          loading={loading}
          title="Popular Movies"
        />
      </div>
    </div>
  );
};