from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import ast
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from tmdb_service import tmdb_service

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load and preprocess data (reuse your model logic)
def load_data(movies_path, credits_path):
    movies = pd.read_csv(movies_path)
    credits = pd.read_csv(credits_path)
    movies = movies.merge(credits, left_on="id", right_on="movie_id")
    return movies

def parse_json_column(text):
    try:
        data = ast.literal_eval(text)
        return [d["name"] for d in data]
    except:
        return []

def get_top_cast(text):
    try:
        data = ast.literal_eval(text)
        return [d["name"] for d in data[:3]]
    except:
        return []


def get_director(text):
    try:
        data = ast.literal_eval(text)
        for d in data:
            if d.get("job") == "Director":
                return d["name"]
        return ""
    except:
        return ""

def preprocess(movies):
    movies["genres"] = movies["genres"].apply(parse_json_column)
    movies["keywords"] = movies["keywords"].apply(parse_json_column)
    movies["cast"] = movies["cast"].apply(get_top_cast)
    movies["crew"] = movies["crew"].apply(get_director)
    movies["overview"] = movies["overview"].fillna("")
    movies["tags"] = (
        movies["overview"]
        + " "
        + movies["genres"].apply(lambda x: " ".join(x))
        + " "
        + movies["keywords"].apply(lambda x: " ".join(x))
        + " "
        + movies["cast"].apply(lambda x: " ".join(x))
        + " "
        + movies["crew"]
    )
    return movies

def build_similarity(movies):
    tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
    movie_vectors = tfidf.fit_transform(movies["tags"]).toarray()
    similarity = cosine_similarity(movie_vectors)
    return similarity

# Load model data once
movies_path = "C:\\Users\\Mayank Singh Tomar\\OneDrive\\Desktop\\Project1\\CineMatches\\Cinematch\\tmdb_5000_movies.csv"
credits_path = "C:\\Users\\Mayank Singh Tomar\\OneDrive\\Desktop\\Project1\\CineMatches\\Cinematch\\tmdb_5000_credits.csv"
movies = load_data(movies_path, credits_path)
movies = preprocess(movies)
similarity = build_similarity(movies)


mood_map = {
    "happy": ["Comedy", "Romance", "Adventure"],
    "sad": ["Drama", "Romance"],
    "excited": ["Action", "Thriller"],
    "relaxed": ["Animation", "Family", "Fantasy"],
}

def recommend_by_mood(mood, movies, top_n=5):
    genres = mood_map.get(mood.lower(), [])
    if not genres:
        return [], f"No mapping found for mood: {mood}"
    filtered = movies[movies["genres"].apply(lambda g: any(x in g for x in genres))]
    sample = filtered.sample(min(top_n, len(filtered)))
    recommendations = []
    for _, row in sample.iterrows():
        movie_title = row.title_x
        
        # Try to find the movie on TMDB to get poster images
        tmdb_movie = None
        try:
            search_results = tmdb_service.search_movies(movie_title)
            if search_results and 'results' in search_results and search_results['results']:
                # Find the best match (first result or exact title match)
                for result in search_results['results']:
                    if result['title'].lower() == movie_title.lower():
                        tmdb_movie = result
                        break
                if not tmdb_movie:
                    tmdb_movie = search_results['results'][0]  # Use first result as fallback
        except Exception as e:
            print(f"Error searching TMDB for {movie_title}: {e}")
        
        recommendations.append({
            'id': int(row.id) if hasattr(row, 'id') else 0,
            'title': row.title_x,
            'overview': row.overview if hasattr(row, 'overview') else '',
            'poster_path': tmdb_movie.get('poster_path') if tmdb_movie else None,
            'backdrop_path': tmdb_movie.get('backdrop_path') if tmdb_movie else None,
            'release_date': row.release_date if hasattr(row, 'release_date') else '',
            'vote_average': float(row.vote_average) if hasattr(row, 'vote_average') else 0.0,
            'vote_count': int(row.vote_count) if hasattr(row, 'vote_count') else 0,
            'genres': row.genres if hasattr(row, 'genres') else []
        })
    return recommendations, None


@app.route("/")
def index():
    # Check if request accepts JSON (from React) or HTML (direct browser access)
    if request.headers.get('Accept', '').find('application/json') != -1:
        # Return JSON for React frontend
        movie_titles = movies["title_x"].tolist()
        moods = list(mood_map.keys())
        
        # Get popular movies from TMDB
        popular_movies = tmdb_service.get_popular_movies()
        popular_movies_data = []
        if popular_movies and 'results' in popular_movies:
            for movie in popular_movies['results'][:6]:  # Get top 6
                popular_movies_data.append({
                    'id': movie['id'],
                    'title': movie['title'],
                    'poster_path': movie.get('poster_path'),
                    'poster_url': tmdb_service.get_poster_url(movie.get('poster_path')),
                    'overview': movie['overview'][:150] + '...' if len(movie['overview']) > 150 else movie['overview'],
                    'vote_average': movie['vote_average'],
                    'release_date': movie.get('release_date', '')
                })
        
        return jsonify({
            'movie_titles': movie_titles,
            'moods': moods,
            'popular_movies': popular_movies_data
        })
    else:
        # Return HTML template for direct browser access
        movie_titles = movies["title_x"].tolist()
        moods = list(mood_map.keys())
        
        # Get popular movies from TMDB
        popular_movies = tmdb_service.get_popular_movies()
        popular_movies_data = []
        if popular_movies and 'results' in popular_movies:
            for movie in popular_movies['results'][:6]:  # Get top 6
                popular_movies_data.append({
                    'id': movie['id'],
                    'title': movie['title'],
                    'poster_url': tmdb_service.get_poster_url(movie.get('poster_path')),
                    'overview': movie['overview'][:150] + '...' if len(movie['overview']) > 150 else movie['overview'],
                    'rating': movie['vote_average']
                })
        
        return render_template("index.html", 
                             movie_titles=movie_titles, 
                             moods=moods,
                             popular_movies=popular_movies_data)

@app.route("/recommend", methods=["POST"])
def recommend():
    mode = request.form.get("mode") or request.json.get("mode") if request.json else None
    movie_title = request.form.get("movie_title") or request.json.get("movie_name") if request.json else None
    mood = request.form.get("mood") or request.json.get("mood") if request.json else None
    
    movie_titles = movies["title_x"].tolist()
    moods = list(mood_map.keys())
    
    if mode == "movie":
        try:
            idx = movies[movies["title_x"] == movie_title].index[0]
        except IndexError:
            error_msg = "Movie not found."
            if request.headers.get('Accept', '').find('application/json') != -1:
                return jsonify({'error': error_msg}), 400
            return render_template("index.html", movie_titles=movie_titles, moods=moods, error=error_msg)
        
        distances = similarity[idx]
        movie_list = sorted(list(enumerate(distances)), key=lambda x: x[1], reverse=True)[1:6]
        recommendations = []
        
        for i in movie_list:
            movie_row = movies.iloc[i[0]]
            movie_title = movie_row.title_x
            
            # Try to find the movie on TMDB to get poster images
            tmdb_movie = None
            try:
                search_results = tmdb_service.search_movies(movie_title)
                if search_results and 'results' in search_results and search_results['results']:
                    # Find the best match (first result or exact title match)
                    for result in search_results['results']:
                        if result['title'].lower() == movie_title.lower():
                            tmdb_movie = result
                            break
                    if not tmdb_movie:
                        tmdb_movie = search_results['results'][0]  # Use first result as fallback
            except Exception as e:
                print(f"Error searching TMDB for {movie_title}: {e}")
            
            recommendations.append({
                'id': int(movie_row.id) if hasattr(movie_row, 'id') else 0,
                'title': movie_row.title_x,
                'overview': movie_row.overview if hasattr(movie_row, 'overview') else '',
                'poster_path': tmdb_movie.get('poster_path') if tmdb_movie else None,
                'backdrop_path': tmdb_movie.get('backdrop_path') if tmdb_movie else None,
                'release_date': movie_row.release_date if hasattr(movie_row, 'release_date') else '',
                'vote_average': float(movie_row.vote_average) if hasattr(movie_row, 'vote_average') else 0.0,
                'vote_count': int(movie_row.vote_count) if hasattr(movie_row, 'vote_count') else 0,
                'genres': movie_row.genres if hasattr(movie_row, 'genres') else []
            })
        
        if request.headers.get('Accept', '').find('application/json') != -1:
            return jsonify({'results': recommendations})
        
        rec_titles = [r['title'] for r in recommendations]
        return render_template("index.html", movie_titles=movie_titles, moods=moods, recommendations=rec_titles, selected=movie_title, selected_mode="movie")
        
    elif mode == "mood":
        recommendations, error = recommend_by_mood(mood, movies)
        
        if request.headers.get('Accept', '').find('application/json') != -1:
            if error:
                return jsonify({'error': error}), 400
            return jsonify({'results': recommendations})
        
        rec_titles = [r['title'] for r in recommendations] if recommendations else []
        return render_template("index.html", movie_titles=movie_titles, moods=moods, recommendations=rec_titles, selected_mood=mood, selected_mode="mood", error=error)
    else:
        error_msg = "Please select a recommendation mode."
        if request.headers.get('Accept', '').find('application/json') != -1:
            return jsonify({'error': error_msg}), 400
        return render_template("index.html", movie_titles=movie_titles, moods=moods, error=error_msg)

@app.route("/search")
def search():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'results': []})
    
    search_results = tmdb_service.search_movies(query)
    movies_data = []
    
    if search_results and 'results' in search_results:
        for movie in search_results['results'][:10]:  # Limit to 10 results
            movies_data.append({
                'id': movie['id'],
                'title': movie['title'],
                'poster_path': movie.get('poster_path'),
                'poster_url': tmdb_service.get_poster_url(movie.get('poster_path')),
                'overview': movie['overview'][:200] + '...' if len(movie['overview']) > 200 else movie['overview'],
                'vote_average': movie['vote_average'],
                'release_date': movie.get('release_date', 'N/A')
            })
    
    return jsonify({'results': movies_data})

@app.route("/movie/<int:movie_id>")
def movie_details(movie_id):
    movie = tmdb_service.get_movie_details(movie_id)
    if not movie:
        if request.headers.get('Accept', '').find('application/json') != -1:
            return jsonify({'error': 'Movie not found'}), 404
        return render_template("error.html", message="Movie not found")
    
    movie_data = {
        'id': movie['id'],
        'title': movie['title'],
        'poster_path': movie.get('poster_path'),
        'backdrop_path': movie.get('backdrop_path'),
        'poster_url': tmdb_service.get_poster_url(movie.get('poster_path')),
        'backdrop_url': tmdb_service.get_backdrop_url(movie.get('backdrop_path')),
        'overview': movie['overview'],
        'vote_average': movie['vote_average'],
        'release_date': movie.get('release_date', 'N/A'),
        'runtime': movie.get('runtime', 'N/A'),
        'genres': [genre['name'] for genre in movie.get('genres', [])],
        'budget': movie.get('budget', 0),
        'revenue': movie.get('revenue', 0)
    }
    
    # Return JSON for React frontend
    if request.headers.get('Accept', '').find('application/json') != -1:
        return jsonify(movie_data)
    
    # Return HTML template for direct browser access
    return render_template("movie_details.html", movie=movie_data)

@app.route("/trending")
def trending():
    movie_day = tmdb_service.get_trending_movies('day')
    movie_week = tmdb_service.get_trending_movies('week')
    tv_day = tmdb_service.get_trending_tv('day')
    tv_week = tmdb_service.get_trending_tv('week')
    
    trending_data = {
        'movies_day': [],
        'movies_week': [],
        'tv_day': [],
        'tv_week': []
    }
    
    # Process trending movies (day)
    if movie_day and 'results' in movie_day:
        for movie in movie_day['results'][:10]:
            trending_data['movies_day'].append({
                'id': movie['id'],
                'title': movie['title'],
                'poster_path': movie.get('poster_path'),
                'poster_url': tmdb_service.get_poster_url(movie.get('poster_path')),
                'vote_average': movie['vote_average']
            })
    
    # Process trending movies (week)
    if movie_week and 'results' in movie_week:
        for movie in movie_week['results'][:10]:
            trending_data['movies_week'].append({
                'id': movie['id'],
                'title': movie['title'],
                'poster_path': movie.get('poster_path'),
                'poster_url': tmdb_service.get_poster_url(movie.get('poster_path')),
                'vote_average': movie['vote_average']
            })
    
    # Process trending TV (day)
    if tv_day and 'results' in tv_day:
        for show in tv_day['results'][:10]:
            trending_data['tv_day'].append({
                'id': show['id'],
                'title': show['name'],
                'poster_path': show.get('poster_path'),
                'poster_url': tmdb_service.get_poster_url(show.get('poster_path')),
                'vote_average': show['vote_average']
            })
    
    # Process trending TV (week)
    if tv_week and 'results' in tv_week:
        for show in tv_week['results'][:10]:
            trending_data['tv_week'].append({
                'id': show['id'],
                'title': show['name'],
                'poster_path': show.get('poster_path'),
                'poster_url': tmdb_service.get_poster_url(show.get('poster_path')),
                'vote_average': show['vote_average']
            })
    
    # Return JSON for React frontend
    if request.headers.get('Accept', '').find('application/json') != -1:
        return jsonify({
            'movies': trending_data['movies_day'] + trending_data['movies_week'],
            'tv_shows': trending_data['tv_day'] + trending_data['tv_week'],
            'trending': trending_data
        })
    
    # Return HTML template for direct browser access
    return render_template("trending.html", trending=trending_data)

@app.route("/popular")
def popular():
    popular_movies = tmdb_service.get_popular_movies()
    movies_data = []
    
    if popular_movies and 'results' in popular_movies:
        for movie in popular_movies['results']:
            movies_data.append({
                'id': movie['id'],
                'title': movie['title'],
                'poster_path': movie.get('poster_path'),
                'poster_url': tmdb_service.get_poster_url(movie.get('poster_path')),
                'overview': movie['overview'][:200] + '...' if len(movie['overview']) > 200 else movie['overview'],
                'vote_average': movie['vote_average'],
                'release_date': movie.get('release_date', 'N/A')
            })
    
    # Return JSON for React frontend
    if request.headers.get('Accept', '').find('application/json') != -1:
        return jsonify({'results': movies_data})
    
    # Return HTML template for direct browser access
    return render_template("popular.html", movies=movies_data)
if __name__ == "__main__":
    app.run(debug=True)
