// Create Character Menu
import React from 'react';
import '../styles/create_character.css';
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateCharacter (){
    const [classes,setClasses] = useState([]); 
    const [selectedClass,setSelectedClass] = useState(""); 
    const [formData,setFormData] = useState("");
    const navigate = useNavigate();

useEffect(() => {
    fetch('http://127.0.0.1:5000/api/classes')
    .then(res => res.json())
    .then(data => {
        setClasses(data);
        setSelectedClass(data[0].id)
    })
    .catch(err => {
        console.error(err);
    });
},[])

const handleChange = (e) =>   {
  const { name, value, type } = e.target;

  if (type === "text") {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  } else {
    setSelectedClass(value);
  }
};

const handleSubmit = (e) => 
  {
    e.preventDefault();

    const character = {
      character_name: formData.character_name,
      class_id: selectedClass
    };

    console.log("Submitting:", character);

    fetch(`http://127.0.0.1:5000/api/characters`, 
    {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(character)
    })

    .then(res => res.json())
    .then(data => {
      console.log("Saved:", data);
      navigate("/");
    })
    .catch(err => console.error("Error saving:", err));
  };

return (
    <div>
    <h1>Create Character</h1>
    <form onSubmit={handleSubmit}>
      <label>
        Name
          <input className="inputText" type="text" name="character_name" value={formData.location} onChange={handleChange} /><br />
      </label><br />

      <label>
      Classes
      <select name="Class" value={selectedClass} onChange={handleChange}>
          {classes.map((cls) => (<option key={cls.id} value={cls.id}>{cls.class_name}</option>))}
      </select>
      </label><br />
    <button type="submit">Create</button>
    </form>
    </div>
)
}

export default CreateCharacter;