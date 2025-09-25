import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function CharacterList() {
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

  const handleDeleteChar = (char_id) =>
  {
    fetch(`http://127.0.0.1:5000/api/characters/${char_id}`, 
    {
      method: 'DELETE',
    })
    .then((res) => {
      setCharacters(prev => prev.filter(char => char.id !== char_id));
      if (!res.ok) throw new Error("Failed to delete");
    })
    .catch(err => console.error("Delete error:", err));
  }

  if (loading) return <p>Loading...</p>;

  return (
    <section>
      <h2>Characters</h2>
      <ul className='link-list'>
        {characters.map((char) => (
          <li key={char.id}>
            <button onClick={() => handleDeleteChar(char.id)}>X</button> <Link to={`/characters/${char.id}`}> {char.name} (Level {char.level}) </Link> <br/>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CharacterList;