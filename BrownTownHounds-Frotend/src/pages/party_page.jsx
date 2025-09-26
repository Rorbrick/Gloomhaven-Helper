import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

function PartyDetails() {
    const [party,setParty] = useState(null);
    const [partyNotes,setPartyNotes] = useState([]);
    const { id } = useParams();
    const [formData,setFormData] = useState({
        reputation: '',
        location: ''
    })
    const [noteText,setNoteText] = useState("");

//Get party details from backend and store here
useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/parties/${id}`)
        .then(res => res.json())
        .then(data => setParty(data))
        .catch(err => console.error(err));
        }, [id]);

//Get party notes from backend and store here
useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/parties/${id}/notes`)
        .then(res => res.json())
        .then(data => setPartyNotes(data))
        .catch(err => console.error(err));
        }, [id]);
        
//Update form data using party details
useEffect(() => {
    if (party) {
        setFormData({
            reputation: party.reputation,
            location: party.location
        })
    }
}, [party])

    const handleChange = (e) => {
        const {name, value} = e.target;
            setFormData(prevFormData => ({...prevFormData,[name]: value}));
        
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formName = e.currentTarget.dataset.form
        const payload = (formName === "note") 
        ? {url: `http://127.0.0.1:5000/api/parties/${id}/notes`, data: { text:noteText }, method:"POST"} 
        : {url:`http://127.0.0.1:5000/api/parties/${id}`, data:formData, method:"PATCH"};

        console.log("Submitting:", payload.data);
        fetch(payload.url, 
        {
            method: payload.method,
            headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload.data)
        })
        .then(res => res.json())
        .then(data => {
        console.log("Saved:", data);
        setPartyNotes(data)
        formName === 'note' && setNoteText('');
        })
        .catch(err => console.error("Error saving:", err));
    };

    const handleDeleteNote = (note_id) => {
        fetch(`http://127.0.0.1:5000/api/parties/${id}/notes/${note_id}`, 
        {
            method: 'DELETE',
        })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to delete");
            // Optionally refetch or update state manually
            setPartyNotes(prev => prev.filter(note => note.id !== note_id));
        })
        .catch(err => console.error("Delete error:", err));
    }

    if (!party) return <p>Loading...</p>;

    return (
        <div>
            <h2>{party.name}</h2>
            <form onSubmit={handleSubmit}>
                
                <label>
                    Location
                    <input className="inputText" type="text" name="location" value={formData.location} onChange={handleChange} /><br />
                </label>
                
                <label>
                    Reputation
                    <input className="inputNum" type="number" name="reputation" value={formData.reputation} onChange={handleChange} /><br />
                </label>
                
                <button type='submit'>Save</button>
            </form>

            <h2>Notes</h2>
            <form onSubmit={handleSubmit} data-form="note">
                <label>
                    <input className="inputText" type="text" name="note" value={noteText} onChange={(e) => setNoteText(e.target.value)}/>
                </label>
                <button type='submit'>Save</button><br/><br/>
            </form>

            {partyNotes.map(note => (
                <div key={note.id}>
                    {note.text} <button onClick={() => handleDeleteNote(note.id)}>X</button><br/>
                    <span className="timestamp">{note.timestamp}</span><br/><br/>
                </div>
            ))}
        </div>
    )
}

export default PartyDetails