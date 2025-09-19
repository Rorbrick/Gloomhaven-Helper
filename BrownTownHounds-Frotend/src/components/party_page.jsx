import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

function PartyDetails() {
    const [party,setParty] = useState(null);
    const { id } = useParams();
    const [formData,setFormData] = useState({
        reputation: '',
        location: ''
    })

useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/parties/${id}`)
        .then(res => res.json())
        .then(data => setParty(data))
        .catch(err => console.error(err));
        }, [id]);
    
useEffect(() => {
    if (party) {
        setFormData({
            reputation: party.reputation,
            location: party.location
        })
    }
}, [party])

    const handleChange = (e) => {
        const {name, value, type} = e.target;
        setFormData(prevFormData => ({
        ...prevFormData,
        [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting:", formData);
        fetch(`http://127.0.0.1:5000/api/parties/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
        console.log("Saved:", data);
        })
        .catch(err => console.error("Error saving:", err));
    };

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
        </div>
    )
}

export default PartyDetails