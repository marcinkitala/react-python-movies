export default function MovieListItem(props) {
    
    const handleDeleteClick = () => {
        const isConfirmed = window.confirm("Do you really want to delete this movie?");
        
        if (isConfirmed) {
            props.onDelete();
        }
    };

    const formatActors = (actorsList) => {
        if (!actorsList || actorsList.length === 0) return "No actors assigned";
        return actorsList.map(actor => actor.name).join(", ");
    };

    return (
        <div>
            <div>
                <strong>{props.movie.title}</strong>
                {' '}
                <span>({props.movie.year})</span>
                {' '}
                {props.movie.director && <span>directed by {props.movie.director}</span>}
                {' '}
                <a onClick={handleDeleteClick} style={{cursor: 'pointer', color: 'red', marginLeft: '10px'}}>Delete</a>
            </div>
            
            <p>{props.movie.description}</p>
            
            <div style={{fontSize: '0.9em', color: '#666'}}>
                <strong>Actors: </strong> {formatActors(props.movie.actors)}
            </div>
        </div>
    );
}