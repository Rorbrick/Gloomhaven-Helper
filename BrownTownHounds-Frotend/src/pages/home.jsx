// Create Character Menu
import React from 'react';
import '../styles/home.css';
import CharacterList from '../components/get_characters';
import PartyList from '../components/get_parties';

const Home = () => {
  return (
        <div className = 'main-class'>
          <div className='characters'>
            <CharacterList />
          </div>
          <div className='parties'>
            <PartyList />
          </div>
        </div>
  );
};

export default Home;