// Create Character Menu
import React from 'react';
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/create_character.css';

function CreateCharacter (){
    const [classes,setClasses] = useState([]); 
    const [selectedClass,setSelectedClass] = useState(""); 
    const [formData,setFormData] = useState("");
    const [charCard,setCharCard] = useState(null);
    const [charCardBack,setCharCardBack] = useState(null);
    const navigate = useNavigate();

useEffect(() => {
    fetch('http://127.0.0.1:5000/api/classes')
    .then(res => res.json())
    .then(data => {
        setClasses(data);
        setSelectedClass(data[0].id)
        setCharCard('/public/images/gh-' + data[0].class_name + '.png');
        setCharCardBack('/public/images/gh-' + data[0].class_name + '-back.png');
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
    setCharCard('/public/images/gh-' + classes[value-1].class_name + '.png');
    setCharCardBack('/public/images/gh-' + classes[value-1].class_name + '-back.png');
  }
};

const handleSubmit = (e,className) => 
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
    <div className="createCharMainWrapper">
    <h1 className="partyName">Create Character</h1>
      <div className="createCharInnerWrapper">
        <div className="createCharInputDiv">
          <form onSubmit={handleSubmit}>
            <>Name &nbsp;</> 
            <input className="inputText" type="text" name="character_name" value={formData.location} onChange={handleChange} /><br />
            <label>
            <>Classes &nbsp;</>
            <select name="Class" value={selectedClass} onChange={handleChange}>
                {classes.map((cls) => (<option key={cls.id} value={cls.id}>{cls.class_name}</option>))}
            </select>
            </label><br />
          <button className="saveButton" type="submit">Create</button>
          </form>
        </div>
      </div>
      <div className='charCardWrapper'>
        <div className="charCardDiv">
          <img className="nameplate" src={charCard} alt={charCard} />
        </div>
        <div className="charCardDiv">
          <img className="nameplate" src={charCardBack} alt={charCardBack} />
        </div> 
      </div>
    </div>
)
}

export default CreateCharacter;