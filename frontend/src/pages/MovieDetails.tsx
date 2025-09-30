import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { movieApi, Movie, getImageUrl, getRatingClass, formatDate } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const movieData = await movieApi.getMovieDetails(parseInt(id));
        setMovie(movieData);
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load movie details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="loading-shimmer h-8 w-32 mb-8 rounded" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="loading-shimmer aspect-[2/3] rounded-xl" />
            <div className="md:col-span-2 space-y-4">
              <div className="loading-shimmer h-12 w-3/4 rounded" />
              <div className="loading-shimmer h-6 w-1/2 rounded" />
              <div className="loading-shimmer h-32 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The movie you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const posterUrl = getImageUrl(movie.poster_path);
  const backdropUrl = getImageUrl(movie.backdrop_path, 'original');
  const ratingClass = getRatingClass(movie.vote_average);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Backdrop */}
      <div className="relative">
        <div 
          className="h-[60vh] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>
        
        <div className="absolute top-8 left-4 z-10">
          <Link to="/">
            <Button variant="outline" className="backdrop-blur-glass">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Movie Details */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="flex justify-center md:justify-start">
            <div className="movie-card max-w-sm">
              <img
                src={posterUrl}
                alt={movie.title}
                className="movie-card-poster"
              />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className={`movie-card-rating ${ratingClass}`}>
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-xs">({movie.vote_count} votes)</span>
                </div>
                
                {movie.release_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(movie.release_date)}</span>
                  </div>
                )}
                
                {movie.runtime && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-accent rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.overview || 'No overview available for this movie.'}
                </p>
              </div>
            </div>

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Production Companies</h3>
                <div className="flex flex-wrap gap-4">
                  {movie.production_companies.map((company) => (
                    <div key={company.id} className="flex items-center gap-2">
                      {company.logo_path && (
                        <img
                          src={getImageUrl(company.logo_path, 'w300')}
                          alt={company.name}
                          className="h-8 object-contain"
                        />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {company.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Star className="w-4 h-4 mr-2" />
                Add to Watchlist
              </Button>
              <Button
                variant="outline"
                size="lg"
              >
                Get Similar Movies
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};