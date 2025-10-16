import { useEffect,useState } from "react";
import { useParams } from 'react-router-dom';
import React from 'react';
import '../styles/retired_characters.css';

function RetiredCharacters (){
    const [retiredCharacters,setRetiredCharacters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/retiredcharacters`)
        .then(res => res.json())
        .then(data => {
            setRetiredCharacters(data);
            setLoading(false);
        })
        .catch(err => {
        console.error(err);
        setLoading(false);
      });
    },[]);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="retiredCharactersMainWrapper">
            <h1 className='partyName'>Retired Characters</h1>
            <div className ="retiredCharactersDiv">
                {retiredCharacters.map(retiredChar => (
                        <ul className="retiredCharList">
                            <h2 className="retiredCharName">{retiredChar.name}</h2>
                            <li>Class: {retiredChar.class}</li>
                            <li>Level: {retiredChar.level}</li>
                            <li>Gold: {retiredChar.gold}</li>
                        </ul>
                ))}
            </div>
        </div>
    )   
}

export default RetiredCharacters