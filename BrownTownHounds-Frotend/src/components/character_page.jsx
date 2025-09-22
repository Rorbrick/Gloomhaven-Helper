import { useEffect,useState } from "react";
import { useParams } from 'react-router-dom';
import React from 'react';

function CharacterDetails () {
  const [character, setCharacter] = useState([]);
  const [classDetails, setClassDetails] = useState([]);
  const [selectedPerks, setSelectedPerks] = useState([]);
  const { id } = useParams();
  const [formData,setFormData] = useState ({
    gold: "",
    xp: ""
  })

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


  const handleChange = (e) => 
  {
    const { name, value } = e.target;
    setFormData(prevFormData => ({...prevFormData, [name]: value}));
  };

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

  const handleCheckboxChange = (perk_id,checkbox_id,e) =>
  {
    setSelectedPerks((prev) => prev.some(p => p.perk_id === perk_id && p.checkbox_id === checkbox_id) 
    ? prev.filter(perk => !(perk.perk_id === perk_id && perk.checkbox_id === checkbox_id)) 
    : [...prev, {perk_id,checkbox_id}]);

    let t_unlocked = e.target.checked ? checkbox_id : checkbox_id - 1;
    const patch_data = {perk_id,times_unlocked: t_unlocked}
    
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
        <>
          <input type="checkbox" 
          key={i+1}
          checked={i < character.perk_points}
          onChange={(e) => handleCheckboxChangePP(i+1)}
          disabled={(i+1) != 1 && i > character.perk_points}/>
          
          {(i + 1) % 3 === 0 && <>✓ </>}
        </>
        )}
    </div>
  )
}

export default CharacterDetails;