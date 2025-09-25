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

        // Ok this one might be a bit funky. 
        const init = []; //We initialize an empty list first
        for (const p of data.perks ?? []) //then we loop through our list of perks (and their details). return empty if data.perks has no content
          { 
          for (let i = p.times_unlocked; i > 0; i--) //now we need to loop down for number of times unlocked. for example, if something has been unlocked twice, add two entries.
            { 
              init.push({ perk_id: p.perk_id, checkbox_id: i }); //then append the perk ID and checkbox id to the init list. checkbox id should be equal I. 
            }
          }

        setSelectedPerks(init)
        return fetch(`http://127.0.0.1:5000/api/classes/${data.class_id}`); //Because we are doing an arrow function with multiple statments (using curly braces), we have to explicitely return something.
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

    {/** Delete specific note if X was clicked */}
  const handleDeleteNote = (note_id) => {
    fetch(`http://localhost:5000/api/characters/${id}/notes/${note_id}`, 
    {
      method: 'DELETE',
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to delete");
      // Optionally refetch or update state manually
      setCharacterNotes(prev => prev.filter(note => note.id !== note_id));
    })
    .catch(err => console.error("Delete error:", err));
  }

  if (!character) return <p>Loading...</p>;

  return (
    <div>
        {/** Display character name and class from the set character details fetched previously. */}
        <h2>{character.name} - {character.class_name}</h2>
        <p>Level: {character.level}</p>

        {/** Adjust XP and/or gold */}
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

        {/** Here's your list of perks and checkboxes for unlocking*/}
        <h2>Perks</h2>
        <ul className="plain-list">
          {/** getting into some JSX looping madness here to display the perk checkboxs*/}
          {classDetails.map((perk) => ( //use .map to loop through list of perk dictionaries.
            <li key={perk.perk_id}>
              {Array.from({ length: perk.times_unlockable }).map((_, i) => ( //if a perk can be unlocked more than once, we want to create more than one checkbox. we use array.from to loop.
                <input type="checkbox" 
                checked={selectedPerks.some(p => p.perk_id === perk.perk_id && p.checkbox_id == i+1)} //if the perk and checkbox IDs exist in selectedPerks, set the box as checked
                key={i+1} //adding +1 here so that the keys start at 1 instead of 0.
                onChange={(e) => handleCheckboxChange(perk.perk_id,i+1,e)} //when we either ckeck or uncheck a box, handle the change
                disabled={i===1 && !selectedPerks.some(p => p.perk_id === perk.perk_id && p.checkbox_id === 1)}/> //disabling second checkbox if the first one has not been unlocked 
              ))}                                                                                               
            {perk.perk_name}</li>
          ))}
        </ul>

        <h2>Perk Points</h2>
        {Array.from({ length: 18 }).map((_,i) => //generate 18 checkboxes for perk points
        <React.Fragment key={i + 1}>
          <input type="checkbox" 
          checked={i < character.perk_points} //check any box id that is one less than characters perk points (checkbox id starts at 0, so if 1 perk point is unlocked, 0 should be checked)
          onChange={(e) => handleCheckboxChangePP(i+1)} //if a box is checked or unchecked, handle change
          disabled={(i+1) != 1 && i > character.perk_points} //checkbox 0 should never be disabled. also, disable checkbox two away from number of perk points character has
          />
          
          {(i + 1) % 3 === 0 && <>✓ </>}
        </React.Fragment> // have to use fragment here because we are returning two things in the array
        )}

        {/** just handling creation of notes here. */}
        <h2>Notes</h2>
        <form onSubmit={e => handleSubmitNotes(e)}>
          <input className="inputNum" type="text" name="note_text" value={noteText} onChange={(e) => setNoteText(e.target.value)}/><br />
          <button type="submit">Save</button> 
        </form><br/>

        {/** displaying notes and allowing user to delete */}
        {characterNotes.map(note => (
          <div key={note.id}>
            {note.text} <button onClick={() => handleDeleteNote(note.id)}>X</button><br/>
            <span className="timestamp">{note.timestamp}</span><br/><br/>
          </div>
          ))}
    </div>
  )
}

export default CharacterDetails;