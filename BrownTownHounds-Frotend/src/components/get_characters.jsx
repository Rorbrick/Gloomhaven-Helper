import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCharacters } from '../api/characters.query.js';

function CharacterList() {
  const { data: characters, isLoading, error } = useCharacters();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Oops: {String(error.message || error)}</p>;

  return (
    <section>
      <h2 className="partyName">Characters</h2>
      <ul className='link-list'>
        {characters?.map((char) => (
          <li key={char.id}>
            <Link className="homeSelect" to={`/characters/${char.id}`}> {char.name} (Level {char.level}) </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CharacterList;