import axios from 'axios';

// Prefer environment override, fallback to Flask default http://127.0.0.1:5000
const API_BASE_URL = (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) 
  || import.meta?.env?.VITE_API_BASE_URL 
  || 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
}

export interface ApiResponse<T> {
  results: T[];
  total_pages: number;
  total_results: number;
  page: number;
}

export interface SearchResult {
  movies: Movie[];
  query: string;
}

export interface RecommendationRequest {
  movie_id?: number;
  movie_name?: string;
  mood?: string;
  genre?: string;
}

// Helper function for handling API errors and retries
const apiRequest = async <T>(requestFn: () => Promise<T>, retries = 2): Promise<T> => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await requestFn();
    } catch (error: any) {
      const isLastAttempt = i === retries;
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        if (isLastAttempt) {
          throw new Error('Request timed out. Please check your connection and try again.');
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      
      if (error.response?.status >= 500 && !isLastAttempt) {
        // Server error, retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      
      // Don't retry on client errors (4xx) or on last attempt
      throw error;
    }
  }
  throw new Error('Maximum retries exceeded');
};

// API Functions
export const movieApi = {
  // Get homepage data
  getHomepage: async () => {
    return apiRequest(async () => {
      const response = await api.get('/');
      return response.data;
    });
  },

  // Search movies
  searchMovies: async (query: string): Promise<SearchResult> => {
    if (!query.trim()) return { movies: [], query: '' };
    
    return apiRequest(async () => {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`, {
        timeout: 8000 // Shorter timeout for search
      });
      return {
        movies: response.data.results || response.data.movies || [],
        query
      };
    }, 1); // Only 1 retry for search
  },

  // Get movie details
  getMovieDetails: async (movieId: number): Promise<Movie> => {
    return apiRequest(async () => {
      const response = await api.get(`/movie/${movieId}`);
      return response.data;
    });
  },

  // Get popular movies
  getPopularMovies: async (): Promise<Movie[]> => {
    return apiRequest(async () => {
      const response = await api.get('/popular');
      return response.data.results || response.data.movies || [];
    });
  },

  // Get trending content
  getTrending: async (): Promise<{ movies: Movie[]; tv_shows: Movie[] }> => {
    return apiRequest(async () => {
      const response = await api.get('/trending');
      return {
        movies: response.data.movies || [],
        tv_shows: response.data.tv_shows || []
      };
    });
  },

  // Get recommendations
  getRecommendations: async (request: RecommendationRequest): Promise<Movie[]> => {
    return apiRequest(async () => {
      const response = await api.post('/recommend', request, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 20000 // Longer timeout for recommendations
      });
      return response.data.results || [];
    });
  }
};

// Helper functions
export const getImageUrl = (path: string | null, size: 'w300' | 'w500' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder.svg';
  // If it's already a full URL, return as is
  if (path.startsWith('http')) return path;
  // Otherwise, construct TMDb image URL
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getRatingClass = (rating: number): string => {
  if (rating >= 7) return 'rating-high';
  if (rating >= 5) return 'rating-medium';
  return 'rating-low';
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).getFullYear().toString();
  } catch {
    return '';
  }
};
