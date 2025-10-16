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

  const handleDeleteParty = (party_id) =>
  {
    fetch(`http://127.0.0.1:5000/api/parties/${party_id}`,
      {method: 'DELETE',})
      .then((res) => {
      if (!res.ok) throw new Error("Failed to delete");
      // Optionally refetch or update state manually
      setParties(prev => prev.filter(party => party.id !== party_id));
    })
    .catch(err => console.error("Delete error:", err));
  }

  if (loading) return <p>Loading...</p>;

  return (
    <section>
      <h2 className="partyName">Parties</h2>
      <ul className='link-list'>
        {parties.map((party) => (
          <li key={party.id}>
            {/*<button className='deleteButton' onClick={() => handleDeleteParty(party.id)}>X</button>*/}
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