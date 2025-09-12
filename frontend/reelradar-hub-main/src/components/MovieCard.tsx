import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Movie, getImageUrl, getRatingClass, formatDate } from '@/services/api';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export const MovieCard = ({ movie, className = '' }: MovieCardProps) => {
  const posterUrl = getImageUrl(movie.poster_path);
  const rating = movie.vote_average;
  const ratingClass = getRatingClass(rating);

  return (
    <Link
      to={`/movie/${movie.id}`}
      className={`movie-card group ${className}`}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={posterUrl}
          alt={movie.title}
          className="movie-card-poster group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        
        {/* Rating badge */}
        <div className="absolute top-2 right-2">
          <div className={`movie-card-rating ${ratingClass}`}>
            <Star className="w-3 h-3 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="movie-card-content">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="text-sm text-muted-foreground">
          {formatDate(movie.release_date)}
        </div>
      </div>
    </Link>
  );
};

export const MovieCardSkeleton = () => (
  <div className="movie-card">
    <div className="loading-shimmer aspect-[2/3] rounded-t-xl" />
    <div className="movie-card-content">
      <div className="loading-shimmer h-4 w-3/4 rounded" />
      <div className="loading-shimmer h-3 w-1/2 rounded mt-2" />
    </div>
  </div>
);