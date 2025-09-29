import { useEffect,useState } from "react";
import { useParams } from 'react-router-dom';
import React from 'react';

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
        <div>
            <h1>Retired Characters</h1>
            {retiredCharacters.map(retiredChar => (
                <ul>
                    <li>Name: {retiredChar.name}</li>
                    <li>Class: {retiredChar.class}</li>
                    <li>Level: {retiredChar.level}</li>
                    <li>Gold: {retiredChar.gold}</li><br />
                </ul>
            ))}
        </div>
    )   
}

export default RetiredCharacters