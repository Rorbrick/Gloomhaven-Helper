// MenuBar.jsx
import { NavLink } from "react-router-dom";
import '../styles/MenuBar.css';
import BasicMenu from './basicMenu.jsx';
import MobileMenu from './mobileMenu.jsx';
import { useCharacters } from '../api/characters.query.js';
import { useParties } from '../api/parties.query.js';

const MenuBar = () => {
  const { data: characters } = useCharacters();
  const { data: parties } = useParties();
  const charactersList = characters ?? [];
  const partiesList = parties ?? [];


  return (
    <header className="menu-bar">
      <nav className="nav-container">
        <div className="logo"><NavLink to="/">Gloomhaven Helper</NavLink></div>
        <ul className="nav-links">
          <li className="mobileMenu"><MobileMenu/></li>
          <li className="basicMenu"><BasicMenu title="Characters" api_root={'/characters/'} data={charactersList} /></li>
          <li className="basicMenu"><BasicMenu title="Parties" api_root={'/parties/'} data={partiesList} /></li>
          <li><NavLink to="/create-character">Create Character</NavLink></li>
          <li><NavLink to="/create-party">Create Party</NavLink></li>
          <li><NavLink to="/retired-characters">Retired Characters</NavLink></li>
        </ul>
      </nav>
    </header>
  );
};

export default MenuBar;