// MenuBar.jsx
import { NavLink } from "react-router-dom";
import React from 'react';
import '../styles/MenuBar.css';
import BasicListbox from './listbox';
import { useEffect, useState } from 'react';

const MenuBar = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/characters')
      .then(res => res.json())
      .then(data => {
        setCharacters(data.characters);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <header className="menu-bar">
      <nav className="nav-container">
        <div className="logo"><NavLink to="/">Gloomhaven Helper</NavLink></div>
        <ul className="nav-links">
          <li><NavLink to="/create-character">Create Character</NavLink></li>
          <li><NavLink to="/create-party">Create Party</NavLink></li>
          <li><NavLink to="/retired-characters">Retired Characters</NavLink></li>
        </ul>
      </nav>
    </header>
  );
};

export default MenuBar;