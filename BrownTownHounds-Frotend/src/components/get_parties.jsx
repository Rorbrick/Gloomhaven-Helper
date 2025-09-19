import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function PartyList() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/parties')
      .then(res => res.json())
      .then(data => {
        setParties(data.parties);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <section>
      <h2>Parties</h2>
      <ul className='link-list'>
        {parties.map((party) => (
          <li key={party.id}>
            <Link to={`/parties/${party.id}`}>
              {party.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default PartyList;