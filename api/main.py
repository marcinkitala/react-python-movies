from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import sqlite3

class Actor(BaseModel):
    name: str

class Movie(BaseModel):
    title: str
    year: str
    actor_ids: List[int] = [] 

app = FastAPI()

app.mount("/static", StaticFiles(directory="../ui/build/static", check_dir=False), name="static")

# inicjalizacja bazy
def init_db():
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()

    # tabela filmy
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            year TEXT NOT NULL
        )
    ''')
    # tabela aktorzy
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS actors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    ''')
    # tabela połącznie aktorzy - filmy
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS movie_actors (
            movie_id INTEGER,
            actor_id INTEGER,
            FOREIGN KEY(movie_id) REFERENCES movies(id),
            FOREIGN KEY(actor_id) REFERENCES actors(id)
        )
    ''')
    db.commit()
    db.close()

init_db()

@app.get("/")
def serve_react_app():
   return FileResponse("../ui/build/index.html")

# endpointy aktorzy

@app.get('/actors')
def get_actors():
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute('SELECT * FROM actors')
    actors = [{'id': row[0], 'name': row[1]} for row in cursor.fetchall()]
    db.close()
    return actors

@app.post("/actors")
def add_actor(actor: Actor):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute("INSERT INTO actors (name) VALUES (?)", (actor.name,))
    db.commit()
    new_id = cursor.lastrowid
    db.close()
    return {"id": new_id, "name": actor.name}

@app.delete("/actors/{actor_id}")
def delete_actor(actor_id: int):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute("DELETE FROM actors WHERE id = ?", (actor_id,))
    cursor.execute("DELETE FROM movie_actors WHERE actor_id = ?", (actor_id,))
    db.commit()
    db.close()
    return {"message": "Actor deleted"}

# endpointy filmy

@app.get('/movies')
def get_movies():
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    movies_data = cursor.execute('SELECT * FROM movies').fetchall()
    
    output = []
    for movie_row in movies_data:
        m_id, title, year = movie_row[0], movie_row[1], movie_row[2]

        actors_cursor = db.execute('''
            SELECT a.id, a.name 
            FROM actors a
            JOIN movie_actors ma ON a.id = ma.actor_id
            WHERE ma.movie_id = ?
        ''', (m_id,))
        actors = [{'id': a[0], 'name': a[1]} for a in actors_cursor.fetchall()]
        
        movie = {'id': m_id, 'title': title, 'year': year, 'actors': actors}
        output.append(movie)
    
    db.close()
    return output

@app.get('/movies/{movie_id}')
def get_single_movie(movie_id: int):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    movie = cursor.execute("SELECT * FROM movies WHERE id=?", (movie_id,)).fetchone()
    
    if movie is None:
        return {'message': "Movie not found"}
        
    actors_cursor = db.execute('''
        SELECT a.id, a.name 
        FROM actors a
        JOIN movie_actors ma ON a.id = ma.actor_id
        WHERE ma.movie_id = ?
    ''', (movie_id,))
    actors = [{'id': a[0], 'name': a[1]} for a in actors_cursor.fetchall()]
    
    db.close()
    return {'title': movie[1], 'year': movie[2], 'actors': actors}

@app.post("/movies")
def add_movie(movie: Movie):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute("INSERT INTO movies (title, year) VALUES (?, ?)", (movie.title, movie.year))
    movie_id = cursor.lastrowid
    
    for actor_id in movie.actor_ids:
        cursor.execute("INSERT INTO movie_actors (movie_id, actor_id) VALUES (?, ?)", (movie_id, actor_id))
        
    db.commit()
    db.close()
    return {
            "message": f"Movie added successfully",
            "id": movie_id
            }

@app.delete("/movies/{movie_id}")
def delete_movie(movie_id: int):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute("DELETE FROM movies WHERE id = ?", (movie_id,))
    cursor.execute("DELETE FROM movie_actors WHERE movie_id = ?", (movie_id,))
    db.commit()
    deleted = cursor.rowcount
    db.close()
    if deleted == 0:
        return {"message": "Movie not found"}
    return {"message": "Movie deleted"}