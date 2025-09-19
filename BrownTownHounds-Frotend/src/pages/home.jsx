// Create Character Menu
import React from 'react';
import '../styles/home.css';
import CharacterList from '../components/get_characters';
import PartyList from '../components/get_parties';

const Home = () => {
  return (
        <main className = 'main-class'>
          <section className='characters'>
            <CharacterList />
          </section>
          <section className='parties'>
            <PartyList />
          </section>
        </main>
  );
};

export default Home;