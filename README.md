# TMDB Movie Recommender Web Application

A comprehensive movie recommendation web application that combines local dataset analysis with TMDB API integration to provide movie recommendations, search functionality, and access to popular/trending content.

## Features

### Movie Recommendations
- **Movie-based Recommendations**: Get similar movies based on genres, keywords, cast, director, and overview
- **Mood-based Recommendations**: Filter movies by mood categories (action, comedy, drama, etc.)
- Content-based filtering using TF-IDF vectorization and cosine similarity

### TMDB API Integration
- **Movie Search**: Live search with autocomplete functionality
- **Movie Details**: Comprehensive movie information with posters and backdrops
- **Popular Movies**: Browse currently popular movies
- **Trending Content**: View trending movies and TV shows (daily/weekly)
- **High-quality Images**: Movie posters and backdrop images from TMDB

### User Interface
- Responsive design with modern CSS styling
- Interactive search with real-time results
- Movie grid layouts with hover effects
- Navigation between different sections
- Mobile-friendly responsive design

## Setup Instructions

### Prerequisites
- Python 3.7 or higher
- TMDB API account (free)

### Installation

1. **Clone or Download the Project**
   ```bash
   cd e:\Model
   ```

2. **Install Required Packages**
   ```bash
   pip install -r requirements.txt
   ```

3. **Get TMDB API Key**
   - Go to [TMDB website](https://www.themoviedb.org/)
   - Create a free account
   - Go to Settings > API
   - Request an API key
   - Copy your API key

4. **Configure API Key**
   Edit `app/config.py` and replace `YOUR_TMDB_API_KEY_HERE` with your actual API key:
   ```python
   TMDB_API_KEY = "your_actual_api_key_here"
   ```

5. **Ensure Data Files are Present**
   Make sure these files are in the main directory:
   - `tmdb_5000_movies.csv`
   - `tmdb_5000_credits.csv`

### Running the Application

1. **Start the Flask Server**
   ```bash
   cd app
   python app.py
   ```

2. **Access the Application**
   Open your web browser and go to: `http://localhost:5000`

## Usage Guide

### Getting Movie Recommendations

1. **Movie-based Mode**: 
   - Select "Movie-based" mode
   - Enter a movie title you like
   - Get recommendations for similar movies

2. **Mood-based Mode**:
   - Select "Mood-based" mode
   - Choose your desired mood from the dropdown
   - Get movies that match your mood

### Using TMDB Features

1. **Search Movies**:
   - Use the search bar at the top of the page
   - Type movie names to see live search results
   - Click on any result to view detailed information

2. **Browse Popular Movies**:
   - Click "Popular" in the navigation
   - Browse currently popular movies with ratings and release dates

3. **View Trending Content**:
   - Click "Trending" in the navigation
   - See trending movies and TV shows for today and this week

4. **Movie Details**:
   - Click on any movie poster or title
   - View comprehensive information including:
     - Movie poster and backdrop
     - Plot overview
     - Cast and crew information
     - Release date, runtime, and ratings
     - Genres and production details

## File Structure

```
e:\Model\
├── app/
│   ├── app.py                 # Main Flask application
│   ├── config.py              # TMDB API configuration
│   ├── tmdb_service.py        # TMDB API service class
│   ├── static/
│   │   └── style.css          # CSS styling
│   └── templates/
│       ├── index.html         # Main page
│       ├── movie_details.html # Movie details page
│       ├── popular.html       # Popular movies page
│       ├── trending.html      # Trending content page
│       └── error.html         # Error page
├── movie_recommender.py       # Original recommendation script
├── tmdb_5000_movies.csv       # Movie dataset
├── tmdb_5000_credits.csv      # Credits dataset
└── requirements.txt           # Python dependencies
```

## Technology Stack

- **Backend**: Flask (Python web framework)
- **Data Processing**: Pandas, Scikit-learn
- **API Integration**: TMDB API via requests
- **Frontend**: HTML5, CSS3, JavaScript
- **Recommendation Engine**: TF-IDF Vectorization, Cosine Similarity

## API Endpoints

- `/` - Main page with recommendations and popular movies
- `/search` - Movie search API (JSON response)
- `/movie/<id>` - Movie details page
- `/popular` - Popular movies page
- `/trending` - Trending movies and TV shows

## Troubleshooting

### Common Issues

1. **API Key Error**:
   - Ensure you've set your TMDB API key in `config.py`
   - Verify the API key is valid and active

2. **File Not Found Errors**:
   - Check that CSV files are in the correct location
   - Ensure file paths in the code match your directory structure

3. **Import Errors**:
   - Install all required packages: `pip install -r requirements.txt`
   - Ensure you're using Python 3.7+

4. **Server Won't Start**:
   - Check if port 5000 is already in use
   - Ensure all Python dependencies are installed
   - Check for syntax errors in the code

### Getting Help

If you encounter issues:
1. Check the terminal/console for error messages
2. Verify all setup steps have been completed
3. Ensure your TMDB API key is properly configured
4. Check that all required files are present

## License

This project is for educational purposes. Movie data is provided by TMDB API.
