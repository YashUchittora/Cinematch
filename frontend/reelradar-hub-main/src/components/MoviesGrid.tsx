import { Movie } from '@/services/api';
import { MovieCard, MovieCardSkeleton } from './MovieCard';

interface MoviesGridProps {
  movies: Movie[];
  loading?: boolean;
  className?: string;
  title?: string;
}

export const MoviesGrid = ({ 
  movies, 
  loading = false, 
  className = '',
  title 
}: MoviesGridProps) => {
  if (loading) {
    return (
      <div className={className}>
        {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
        <div className="movies-grid">
          {Array.from({ length: 12 }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-4xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold mb-2">No movies found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or check back later for new content.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div className="movies-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};