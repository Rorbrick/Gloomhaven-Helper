import '../styles/App.css'
import MenuBar from '../components/MenuBar';
import CreateCharacter from './create_character';
import CreateParty from './create_party';
import CharacterDetails from '../pages/character_page';
import PartyDetails from '../pages/party_page';
import RetiredCharacters from '../pages/retired_characters';
import Home from './home'
import { Routes, Route } from "react-router-dom";
import React from 'react';

const App = () => {
  return (
      <>
        <MenuBar />
        <main style={{ paddingTop: '60px' }}>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-character" element={<CreateCharacter />} />
              <Route path="/create-party" element={<CreateParty />} />
              <Route path="/characters/:id" element={<CharacterDetails />} />
              <Route path="/parties/:id" element={<PartyDetails />} />
              <Route path="/retired-characters" element={<RetiredCharacters />} />
          </Routes>
        </main>
      </>
   );
};
 
export default App;