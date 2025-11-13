import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateParty } from "../api/parties.query";
import "../styles/create_party.css";

function CreateParty() {
  //Parties
  const { isLoading, error, mutate } = useCreateParty();

  const [formData, setFormData] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Oops: {String(error.message || error)}</p>;

  return (
    <div className="createPartyMainWrapper">
      <h1 className="createPartyName">Create Party</h1>
      <div className="createCharInnerWrapper">
        <div className="createPartyInputDiv">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutate({ party_name: formData.party_name });
              navigate("/");
            }}
          >
            Party Name &nbsp;
            <input
              className="inputText"
              type="text"
              name="party_name"
              value={formData.location}
              onChange={handleChange}
            />
            <br />
            <button className="saveButton" type="submit">
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateParty;
