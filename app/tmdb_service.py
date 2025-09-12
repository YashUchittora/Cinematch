import requests
import time
from config import TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL

class TMDBService:
    def __init__(self):
        self.api_key = TMDB_API_KEY
        self.base_url = TMDB_BASE_URL
        self.image_base_url = TMDB_IMAGE_BASE_URL
        
    def _make_request(self, endpoint, params=None):
        """Make a request to TMDB API with timeout and retry logic"""
        if params is None:
            params = {}
        params['api_key'] = self.api_key
        
        url = f"{self.base_url}/{endpoint}"
        
        # Retry logic with exponential backoff
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.get(
                    url, 
                    params=params, 
                    timeout=(5, 15)  # (connect timeout, read timeout)
                )
                response.raise_for_status()
                return response.json()
            except requests.exceptions.Timeout:
                if attempt == max_retries - 1:
                    print(f"TMDB API timeout after {max_retries} attempts for endpoint: {endpoint}")
                    return None
                print(f"TMDB API timeout, retrying... (attempt {attempt + 1}/{max_retries})")
                time.sleep(2 ** attempt)  # Exponential backoff
            except requests.exceptions.ConnectionError:
                if attempt == max_retries - 1:
                    print(f"TMDB API connection error after {max_retries} attempts for endpoint: {endpoint}")
                    return None
                print(f"TMDB API connection error, retrying... (attempt {attempt + 1}/{max_retries})")
                time.sleep(2 ** attempt)
            except requests.RequestException as e:
                print(f"Error making request to TMDB: {e}")
                return None
        
        return None
    
    def search_movies(self, query, page=1):
        """Search for movies by title"""
        endpoint = "search/movie"
        params = {"query": query, "page": page}
        return self._make_request(endpoint, params)
    
    def get_movie_details(self, movie_id):
        """Get detailed information about a movie"""
        endpoint = f"movie/{movie_id}"
        return self._make_request(endpoint)
    
    def get_popular_movies(self, page=1):
        """Get popular movies"""
        endpoint = "movie/popular"
        params = {"page": page}
        return self._make_request(endpoint, params)
    
    def get_trending_movies(self, time_window="day"):
        """Get trending movies (time_window: 'day' or 'week')"""
        endpoint = f"trending/movie/{time_window}"
        return self._make_request(endpoint)
    
    def get_trending_tv(self, time_window="day"):
        """Get trending TV shows (time_window: 'day' or 'week')"""
        endpoint = f"trending/tv/{time_window}"
        return self._make_request(endpoint)
    
    def get_poster_url(self, poster_path, size="w500"):
        """Get full URL for movie poster"""
        if not poster_path:
            return None
        return f"{self.image_base_url}/{size}{poster_path}"
    
    def get_backdrop_url(self, backdrop_path, size="w1280"):
        """Get full URL for movie backdrop"""
        if not backdrop_path:
            return None
        return f"{self.image_base_url}/{size}{backdrop_path}"
    
    def get_movie_images(self, movie_id):
        """Get all images for a movie"""
        endpoint = f"movie/{movie_id}/images"
        return self._make_request(endpoint)

# Initialize the service
tmdb_service = TMDBService()
