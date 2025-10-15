import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import '../styles/party.css';

function PartyDetails() {
    const [party,setParty] = useState(null);
    const [partyNotes,setPartyNotes] = useState([]);
    const { id } = useParams();
    const [formData,setFormData] = useState("")
    const [noteText,setNoteText] = useState("");
    const [slideValue,setSlideValue] = useState(0);

//Get party details from backend and store here
useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/parties/${id}`)
        .then(res => res.json())
        .then(data => {
            setParty(data)
            setSlideValue(data["reputation"])
        })
        .catch(err => console.error(err));
        }, [id]);

//Get party notes from backend and store here
useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/parties/${id}/notes`)
        .then(res => res.json())
        .then(data => setPartyNotes(data))
        .catch(err => console.error(err));
        }, [id]);
        
/**Update form data using party details
useEffect(() => {
    if (party) {
        setFormData({
            location: party.location
        })
    }
}, [party])*/

const handleSubmitLocation = (e) => {
    e.preventDefault();

    const payload = {location: formData}

    console.log("Submitting:", payload);

    fetch(`http://127.0.0.1:5000/api/parties/${id}`, 
    {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
    setParty(data);
    setFormData("");
    console.log("Saved:", data);
    })
    .catch(err => console.error("Error saving:", err));
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
    setPartyNotes(data);
    setNoteText('');
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

const onChangeSlider = (value) => {
    setSlideValue(value)

    const payload = { reputation:Number(value) }

    fetch(`http://127.0.0.1:5000/api/parties/${id}`, 
    {
        method: 'PATCH',
        headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
    console.log("Saved:", data);
    })
    .catch(err => console.error("Error saving:", err));
}

    if (!party) return <p>Loading...</p>;

    return (
        <div className='mainWrapper'>
            <div className='mainWrapperContainer'>
                <h1 className='partyName'>{party.name}</h1>
                <div className='partyDiv'>
                    <div className='locationContainer'>
                        <h3 className='locationH3'>Current Location</h3>
                        <div className='locationSpan'>{party.location}</div>
                        <div className="inputTextLocation">
                            <form onSubmit={handleSubmitLocation}>
                            <input type="text" name="location" value={formData} onChange={(e) => setFormData(e.target.value)}/> <button type='submit'>Update</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className='notesDiv'>
                    <h3 className='locationH3'>Notes</h3>
                        {partyNotes.map(note => (
                            <div className='notes' key={note.id}>
                                {note.text} <button className='deleteButton' onClick={() => handleDeleteNote(note.id)}>X</button> <br/>
                                <span className="timestamp">{note.timestamp}</span><br/>
                            </div>
                        ))}
                    <div className="inputTextNotesDiv">
                        <form onSubmit={handleSubmit} data-form="note">
                            <input className="inputTextNotes" type="text" name="note" value={noteText} onChange={(e) => setNoteText(e.target.value)}/> <button type='submit'>Post</button><br/>
                        </form>
                    </div>
                </div>

                </div>
                <div className='sliderWrapper'>
                    <input type="range" 
                    className='slider'
                    min="-20" 
                    max="20"
                    onChange={(e) => onChangeSlider(e.target.value)} 
                    value={slideValue}
                    />

                    <div className="imageWrapper">
                        <img className="rep" src="/textures/Party-Sheet.png" alt="Party Sheet" />
                    </div>

            </div>
        </div>
        
    )
}

export default PartyDetails