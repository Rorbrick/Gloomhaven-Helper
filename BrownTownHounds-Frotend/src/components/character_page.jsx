import { useEffect,useState } from "react";
import { useParams } from 'react-router-dom';
import React from 'react';

function CharacterDetails () {
  const [character, setCharacter] = useState([]);
  const [classDetails, setClassDetails] = useState([]);
  const [selectedPerks, setSelectedPerks] = useState([]);
  const [characterNotes, setCharacterNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const { id } = useParams();
  const [formData,setFormData] = useState ({
    gold: "",
    xp: ""
  })

  {/** Fetching character Notes and setting variable */}
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/characters/${id}/notes`)
    .then(res => res.json())
    .then(notes => {
      setCharacterNotes(notes);
      console.log(notes);
    })
    .catch(err => {
      console.error(err);
    })
  }, [id]);

  {/** Fetching character Details (gold, xp, perks unlocked and perk points) and setting variable */}
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/characters/${id}`)
      .then(res => res.json())
      .then(data => {
        setCharacter(data);
        setFormData({ gold: data.gold, xp: data.xp });

        const init = []; 
        for (const p of data.perks ?? []) 
          { 
          const n = Number(p.times_unlocked) || 0; 
          for (let i = p.times_unlocked; i > 0; i--) 
            { 
              init.push({ perk_id: p.perk_id, checkbox_id: i });
            }
          }

        setSelectedPerks(init)
        return fetch(`http://127.0.0.1:5000/api/class/${data.class_id}`); //Because we are doing an arrow function with multiple statments (using curly braces), we have to explicitely return something.
      }) 
      .then(res => res.json())
      .then(classData => {
        setClassDetails(classData);
      })
      .catch(err => {
        console.error(err);
      });
  }, [id]);

  {/** handle change of character xp and gold fields. Update form data with new values */}
  const handleChange = (e) => 
  {
    const { name, value } = e.target;
    setFormData(prevFormData => ({...prevFormData, [name]: value}));
  };

  {/** Submit new xp and gold values. Send an API patch to update values on backend. */}
  const handleSubmit = (e) => 
  {
    e.preventDefault();
    console.log("Submitting:", formData);

    fetch(`http://127.0.0.1:5000/api/characters/${id}`, 
    {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(formData)
    })

    .then(res => res.json())
    .then(data => {
      console.log("Saved:", data);
      setCharacter(data);
    })
    .catch(err => console.error("Error saving:", err));
  };

  {/** Submit a new note and API post it to the backend server */}
  const handleSubmitNotes = (e) => 
  {
    e.preventDefault()
    const new_note = { text: noteText};
    console.log("Submitting:", new_note);

    fetch(`http://127.0.0.1:5000/api/characters/${id}/notes`, 
    {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(new_note)
    })
    .then(res => res.json())
    .then(data => {
      setCharacterNotes(data)
      setNoteText("")
      console.log("Saved:", data);
    })
    .catch(err => console.error("Error saving:", err));
  };

  {/** When a perk is changed (checked or unchecked), update the selectedPerks varaible. */}
  const handleCheckboxChange = (perk_id,checkbox_id,e) =>
  {
    {/** if the perk already exists, remove it. Otherwise, add the new perk */}
    setSelectedPerks((prev) => prev.some(p => p.perk_id === perk_id && p.checkbox_id === checkbox_id) 
    ? prev.filter(perk => !(perk.perk_id === perk_id && perk.checkbox_id === checkbox_id)) 
    : [...prev, {perk_id,checkbox_id}]);

    {/** if we just checked a box, increase times_unlocked, otherwise, if a box was unchecked, reduce times_unlocked by 1. Set the patch data
      then send to backend */}
    let t_unlocked = e.target.checked ? checkbox_id : checkbox_id - 1;
    const patch_data = {perk_id,times_unlocked: t_unlocked};
    
    fetch(`http://127.0.0.1:5000/api/characters/${id}`,
    {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(patch_data)
    })
    .then(res => res.json())
    .then(data => {
      console.log("Saved:", data);
      setCharacter(data);
    })
    .catch(err => console.error("Error saving:", err));
  }

  {/** if a perk point was checked, either add or remove the quantity of perkPontsUnlocked, then PATCH to backend. */}
  const handleCheckboxChangePP = (perkPointsUnlocked) => {
    const patch_data = perkPointsUnlocked > character.perk_points ? {perk_points:perkPointsUnlocked} : {perk_points:(perkPointsUnlocked-1)}

    fetch(`http://127.0.0.1:5000/api/characters/${id}`,
    {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(patch_data)
    })
    .then(res => res.json())
    .then(data => {
      console.log("Saved:", data);
      setCharacter(data);
    })
    .catch(err => console.error("Error saving:", err));
  }

  if (!character) return <p>Loading...</p>;

  return (
    <div>
        <h2>{character.name} - {character.class_name}</h2>
        <p>Level: {character.level}</p>

        <form onSubmit={handleSubmit}>
          <label>
            XP 
            <input className="inputNum" type="number" name="xp" value={formData.xp} onChange={handleChange} />
          </label><br />

          <label>
            Gold 
            <input className="inputNum" type="number" name="gold" value={formData.gold} onChange={handleChange} />
          </label><br />

          <button type="submit">Save</button>
        </form>

        <h2>Perks</h2>
        <ul className="plain-list">
          {classDetails.map((perk) => (
            <li key={perk.perk_id}>
              {Array.from({ length: perk.times_unlockable }).map((_, i) => (
                <input type="checkbox" 
                checked={selectedPerks.some(p => p.perk_id === perk.perk_id && p.checkbox_id == i+1)}
                key={i+1} 
                onChange={(e) => handleCheckboxChange(perk.perk_id,i+1,e)} 
                disabled={i===1 && !selectedPerks.some(p => p.perk_id === perk.perk_id && p.checkbox_id === 1)}/>
              ))}
            {perk.perk_name}</li>
          ))}
        </ul>

        <h2>Perk Points</h2>
        {Array.from({ length: 18 }).map((_,i) =>
        <React.Fragment key={i + 1}>
          <input type="checkbox" 
          checked={i < character.perk_points}
          onChange={(e) => handleCheckboxChangePP(i+1)}
          disabled={(i+1) != 1 && i > character.perk_points}/>
          
          {(i + 1) % 3 === 0 && <>✓ </>}
        </React.Fragment>
        )}

        <h2>Notes</h2>
        <form onSubmit={e => handleSubmitNotes(e)}>
          <input className="inputNum" type="text" name="note_text" value={noteText} onChange={(e) => setNoteText(e.target.value)}/><br />
          <button type="submit">Save</button>
        </form>

        {characterNotes.map(note => (
          <p key={note.id}>
          {note.text}<br/>
          <span className="timestamp">{note.timestamp}</span>
          </p>
          ))}
    </div>
  )
}

export default CharacterDetails;