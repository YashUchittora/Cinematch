# movie_recommender.py

import pandas as pd
import ast
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ---------------- Step 1: Load and Merge ----------------
def load_data(movies_path, credits_path):
    movies = pd.read_csv("tmdb_5000_movies.csv")
    credits = pd.read_csv("tmdb_5000_credits.csv")
    movies = movies.merge(credits, left_on="id", right_on="movie_id")
    return movies


# ---------------- Step 2: Parse JSON-like columns ----------------
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


# ---------------- Step 3: Preprocess and Create Tags ----------------
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


# ---------------- Step 4: Build Similarity Matrix ----------------
def build_similarity(movies):
    tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
    movie_vectors = tfidf.fit_transform(movies["tags"]).toarray()
    similarity = cosine_similarity(movie_vectors)
    return similarity


# ---------------- Step 5: Recommendation Functions ----------------
def recommend(movie_title, movies, similarity, top_n=5):
    try:
        idx = movies[movies["title_x"] == movie_title].index[0]
    except IndexError:
        print(f"Movie '{movie_title}' not found in dataset.")
        return

    distances = similarity[idx]
    movie_list = sorted(
        list(enumerate(distances)), key=lambda x: x[1], reverse=True
    )[1 : top_n + 1]

    print(f"\nMovies similar to '{movie_title}':")
    for i in movie_list:
        print(" -", movies.iloc[i[0]].title_x)


mood_map = {
    "happy": ["Comedy", "Romance", "Adventure"],
    "sad": ["Drama", "Romance"],
    "excited": ["Action", "Thriller"],
    "relaxed": ["Animation", "Family", "Fantasy"],
}


def recommend_by_mood(mood, movies, top_n=5):
    genres = mood_map.get(mood.lower(), [])
    if not genres:
        print(f"No mapping found for mood: {mood}")
        return

    filtered = movies[movies["genres"].apply(lambda g: any(x in g for x in genres))]
    sample = filtered.sample(min(top_n, len(filtered)))[["title_x", "genres", "overview"]]

    print(f"\nMovies for mood '{mood}':")
    for _, row in sample.iterrows():
        print(f" - {row['title_x']} ({', '.join(row['genres'])})")


# ---------------- Main Execution ----------------
if __name__ == "__main__":
    # Change paths if needed
    movies_path = "tmdb_5000_movies.csv"
    credits_path = "tmdb_5000_credits.csv"

    print("Loading data...")
    movies = load_data(movies_path, credits_path)

    print("Preprocessing...")
    movies = preprocess(movies)

    print("Building similarity matrix...")
    similarity = build_similarity(movies)

    # Example usage
    recommend("The Dark Knight", movies, similarity)
    recommend_by_mood("happy", movies)
