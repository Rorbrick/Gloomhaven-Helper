import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDeleteParty, useParties } from "../api/parties.query";

function PartyList() {
  //Parties
  const {
    isLoading: isPartiesLoading,
    error: partiesError,
    data: parties,
  } = useParties();
  const { isLoading: isDeletePartyLoading, error: deletePartiesError } =
    useDeleteParty();

  const isLoading = isPartiesLoading || isDeletePartyLoading;
  const error = partiesError || deletePartiesError;

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Oops: {String(error.message || error)}</p>;

  return (
    <section>
      <h2 className="partyName">Parties</h2>
      <ul className="link-list">
        {parties?.map((party) => (
          <li key={party.id}>
            <Link to={`/parties/${party.id}`}>{party.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default PartyList;
