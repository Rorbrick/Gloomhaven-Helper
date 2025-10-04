import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateParty (){
    const [formData,setFormData] = useState("");
    const navigate = useNavigate();

const handleChange = (e) =>
    {
        const { name, value, type } = e.target;
        setFormData((prevFormData) => ({...prevFormData,[name]: value}));
    };

const handleSubmit = (e) => 
  {
    e.preventDefault();

    const party = {party_name: formData.party_name};

    console.log("Submitting:", party);

    fetch(`http://127.0.0.1:5000/api/parties`, 
    {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(party)
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
            <h1>Create Party</h1>
            <form onSubmit={handleSubmit}>
            <label>
                Party Name
                <input className="inputText" type="text" name="party_name" value={formData.location} onChange={handleChange} /><br />
            </label><br />
            <button type="submit">Create</button>
            </form>
        </div>
    )

}

export default CreateParty;