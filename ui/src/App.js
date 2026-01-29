import './App.css';
import React, { useState, useEffect } from 'react'
import "milligram";
import MovieForm from "./MovieForm";
import MoviesList from "./MoviesList";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [movies, setMovies] = useState([]);
    const [actors, setActors] = useState([]);
    const [addingMovie, setAddingMovie] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const moviesResp = await fetch(`/movies`);
            if (moviesResp.ok) {
                const moviesData = await moviesResp.json();
                setMovies(moviesData);
            }
            const actorsResp = await fetch(`/actors`);
            if (actorsResp.ok) {
                const actorsData = await actorsResp.json();
                setActors(actorsData);
            }
        };
        fetchData();
    }, []);

    async function handleAddMovie(movie) {
        const response = await fetch('/movies', {
            method: 'POST',
            body: JSON.stringify(movie),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const moviesResp = await fetch(`/movies`);
            const moviesData = await moviesResp.json();
            setMovies(moviesData);
            setAddingMovie(false);
            toast.success("Movie added successfully!");
        }
    }

    async function handleAddActor(actorName) {
        const response = await fetch('/actors', {
            method: 'POST',
            body: JSON.stringify({ name: actorName }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const newActor = await response.json();
            setActors([...actors, newActor]);
            toast.success("Actor added successfully!");
        }
    }

    async function handleDeleteActor(id) {
        const response = await fetch(`/actors/${id}`, { method: 'DELETE' });
        if (response.ok) {
            setActors(actors.filter(a => a.id !== id));
            toast.success("Actor removed!");
        }
    }

    async function handleDeleteMovie(movie) {
        const response = await fetch(`/movies/${movie.id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            const nextMovies = movies.filter(m => m.id !== movie.id);
            setMovies(nextMovies);
            toast.success("Movie removed!");
        }
    }

    return (
        <div className="container">
            <ToastContainer position="center" autoClose={1000} />
            <h1>My favourite movies to watch</h1>
            <div>
                <h2>Manage Actors</h2>
                <ul>
                    {actors.map(a => (
                        <li key={a.id} style={{listStyle: 'none'}}>
                            {a.name}
                            <a onClick={() => handleDeleteActor(a.id)} style={{cursor: 'pointer', color: 'red', marginLeft: '10px'}}>
                                Delete
                            </a>
                        </li>
                    ))}
                </ul>
                <button onClick={() => {
                    const name = prompt("Enter actor name:");
                    if(name) handleAddActor(name);
                }}>Add new actor</button>
            </div>

            <hr/>

            {movies.length === 0
                ? <p>No movies yet. Maybe add something?</p>
                : <MoviesList movies={movies}
                              onDeleteMovie={handleDeleteMovie}
                />}
            {addingMovie
                ? <MovieForm 
                    onMovieSubmit={handleAddMovie}
                    availableActors={actors}
                    buttonLabel="Add a movie"
                />
                : <button onClick={() => setAddingMovie(true)}>Add a movie</button>}
        </div>
    );
}

export default App;