import '../styles/App.css'
import MenuBar from '../components/MenuBar';
import CreateCharacter from './create_character';
import CharacterDetails from '../components/character_page';
import PartyDetails from '../components/party_page';
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
              <Route path="/characters/:id" element={<CharacterDetails />} />
              <Route path="/parties/:id" element={<PartyDetails />} />
          </Routes>
        </main>
      </>
   );
};
 
export default App;