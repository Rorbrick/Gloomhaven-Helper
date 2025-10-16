// Create Character Menu
import React from 'react';
import '../styles/home.css';
import CharacterList from '../components/get_characters';
import PartyList from '../components/get_parties';

const Home = () => {
  return (
        <div className = 'homePageMainWrapper'>
          <div className='charactersDiv'>
            <CharacterList />
          </div>
          <div className='partiesDiv'>
            <PartyList />
          </div>
        </div>
  );
};

export default Home;