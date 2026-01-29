import {useState} from "react";

export default function MovieForm(props) {
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');
    const [director, setDirector] = useState('');
    const [description, setDescription] = useState('');
    const [selectedActorIds, setSelectedActorIds] = useState(new Set());

    function addMovie(event) {
        event.preventDefault();
        if (title.length < 5) {
            return alert('Tytuł jest za krótki');
        }
        props.onMovieSubmit({
            title, 
            year, 
            director, 
            description,
            actor_ids: Array.from(selectedActorIds) 
        });
        
        setTitle('');
        setYear('');
        setDirector('');
        setDescription('');
        setSelectedActorIds(new Set());
    }

    function handleActorToggle(actorId) {
        const newSelection = new Set(selectedActorIds);
        if (newSelection.has(actorId)) {
            newSelection.delete(actorId);
        } else {
            newSelection.add(actorId);
        }
        setSelectedActorIds(newSelection);
    }

    return <form onSubmit={addMovie}>
        <h2>Add movie</h2>
        <div>
            <label>Tytuł</label>
            <input type="text" value={title} onChange={(event) => setTitle(event.target.value)}/>
        </div>
        <div>
            <label>Year</label>
            <input type="text" value={year} onChange={(event) => setYear(event.target.value)}/>
        </div>
        <div>
            <label>Director</label>
            <input type="text" value={director} onChange={(event) => setDirector(event.target.value)}/>
        </div>
        <div>
            <label>Description</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)}/>
        </div>
        
        <div style={{marginBottom: '20px'}}>
            <label>Actors</label>
            <div style={{maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px'}}>
                {props.availableActors && props.availableActors.length > 0 ? (
                    props.availableActors.map(actor => (
                        <div key={actor.id}>
                            <label style={{display: 'inline', fontWeight: 'normal'}}>
                                <input
                                    type="checkbox"
                                    checked={selectedActorIds.has(actor.id)}
                                    onChange={() => handleActorToggle(actor.id)}
                                    style={{marginRight: '10px'}}
                                />
                                {actor.name}
                            </label>
                        </div>
                    ))
                ) : (
                    <p>No actors available. Add them first above.</p>
                )}
            </div>
        </div>

        <button>{props.buttonLabel || 'Submit'}</button>
    </form>;
}