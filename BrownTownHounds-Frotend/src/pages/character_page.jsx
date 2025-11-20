import { use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/character.css";
import React from "react";
import BasicDialog from "../components/basic_dialog";
import {
  useCharacter,
  useCharacterNotes,
  useCreateCharacterNote,
  useUpdateCharacter,
  useDeleteCharacterNote,
  useDeleteCharacter,
  useUpdateCharacterPerk,
  useCharacterPerks,
} from "../api/characters.query.js";
import { useClasses, useClass } from "../api/classes.query.js";
import { createPortal } from "react-dom";

function CharacterDetails() {
  const { id } = useParams();

  //TanStack API fetching/parsing
  //Character
  const {
    data: character,
    isLoading: isCharacterLoading,
    error: characterError,
    isSuccess: characterIsSuccess,
  } = useCharacter(id);
  const {
    isLoading: isCharacterUpdateLoading,
    error: characterUpdateError,
    mutate: characterMutate,
  } = useUpdateCharacter(id);
  const {
    data: characterNotes,
    isLoading: isCharacterNotesLoading,
    error: characterNotesError,
  } = useCharacterNotes(id);
  const {
    isLoading: createCharacterNoteIsLoading,
    error: createCharacterNoteError,
    mutate: createNoteMutate,
  } = useCreateCharacterNote(id);
  const {
    isLoading: deleteCharacterNoteIsLoading,
    error: deleteCharacterNoteError,
    mutate: deleteNoteMutate,
  } = useDeleteCharacterNote(id);
  const {
    isLoading: deleteCharacterIsLoading,
    error: deleteCharacterError,
    mutateAsync: deleteCharacterMutate,
  } = useDeleteCharacter(id);
  const {
    isLoading: updateCharacterPerksIsLoading,
    error: updateCharacterPerksError,
    mutateAsync: characterPerksMutate,
  } = useUpdateCharacterPerk(id);
  const {
    data: characterPerks,
    isLoading: characterPerksIsLoading,
    error: characterPerksError,
    isSuccess: characterPerksIsSuccess,
  } = useCharacterPerks(id);

  //Classes
  const classId = character?.class_id;
  const {
    data: charClass,
    isLoading: isClassLoading,
    error: classError,
  } = useClass(classId, !!classId);

  //Checkers - loading and errors
  const isLoading =
    isCharacterLoading ||
    isCharacterNotesLoading ||
    createCharacterNoteIsLoading ||
    isCharacterUpdateLoading ||
    deleteCharacterNoteIsLoading ||
    deleteCharacterIsLoading ||
    isClassLoading ||
    characterPerksIsLoading ||
    updateCharacterPerksIsLoading;
  const error =
    characterError ||
    characterNotesError ||
    createCharacterNoteError ||
    characterUpdateError ||
    deleteCharacterNoteError ||
    deleteCharacterError ||
    classError ||
    characterPerksError ||
    updateCharacterPerksError;

  //To be cleaned
  const navigate = useNavigate();
  const [selectedPerks, setSelectedPerks] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [charNameplate, setCharNameplate] = useState(null);
  const [charPortrait, setCharPortrait] = useState(null);
  const [formData, setFormData] = useState({
    gold: "",
    xp: "",
  });
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [magnifierState, setMagnifierState] = useState(false);
  const [magnifierImage, setMagnifierImage] = useState(null);

  /** Fetching character Details using query hook (gold, xp, perks unlocked and perk points) and setting variable */
  useEffect(
    () => {
      if (characterIsSuccess && character) {
        setFormData({ gold: character.gold, xp: character.xp });
        setCharNameplate(
          "/public/images/" + character.class_name + "-nameplate.png",
        );
        setCharPortrait(
          "/public/images/" + character.class_name + "-portrait.png",
        );

        // Ok this one might be a bit funky.
        const init = []; //We initialize an empty list first
        for (const p of characterPerks ?? []) { //then we loop through our list of perks (and their details). return empty if data.perks has no content
          for (
            let i = p.times_unlocked;
            i > 0;
            i-- //now we need to loop down for number of times unlocked. for example, if something has been unlocked twice, add two entries.
          ) {
            init.push({ perk_id: p.perk_id, checkbox_id: i }); //then append the perk ID and checkbox id to the init list. checkbox id should be equal to i.
          }
        }
        setSelectedPerks(init);
      }
    },
    [character],
    [characterIsSuccess],
  );

  {
    /** Fetching character Details using query hook (gold, xp, perks unlocked and perk points) and setting variable */
  }
  useEffect(
    () => {
      // Ok this one might be a bit funky.
      const init = []; //We initialize an empty list first
      for (const p of characterPerks ?? []) { //then we loop through our list of perks (and their details). return empty if data.perks has no content
        for (
          let i = p.times_unlocked;
          i > 0;
          i-- //now we need to loop down for number of times unlocked. for example, if something has been unlocked twice, add two entries.
        ) {
          init.push({ perk_id: p.perk_id, checkbox_id: i }); //then append the perk ID and checkbox id to the init list. checkbox id should be equal to i.
        }
      }
      setSelectedPerks(init);
    },
    [characterPerks],
    [characterPerksIsSuccess],
  );

  /** handle change of character xp and gold fields. Update form data with new values */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  /** When a perk is changed (checked or unchecked), update the selectedPerks varaible. */
  const handleCheckboxChange = (perk_id, checkbox_id, isChecked) => {
    /** if the perk already exists, remove it. Otherwise, add the new perk */
    setSelectedPerks((prev) =>
      prev.some((p) => p.perk_id === perk_id && p.checkbox_id === checkbox_id)
        ? prev.filter(
            (perk) =>
              !(perk.perk_id === perk_id && perk.checkbox_id === checkbox_id),
          )
        : [...prev, { perk_id, checkbox_id }],
    );

    /** if we just checked a box, increase times_unlocked, otherwise, if a box was unchecked, reduce times_unlocked by 1. Set the patch data
      then send to backend */
    let t_unlocked = isChecked ? checkbox_id - 1 : checkbox_id;
    const patch_data = { perk_id, times_unlocked: t_unlocked };

    characterPerksMutate(patch_data);
  };

  /** if a perk point was checked, either add or remove the quantity of perkPontsUnlocked, then PATCH to backend using query hook. */
  const handleCheckboxChangePP = (perkPointsUnlocked) => {
    const patch_data =
      perkPointsUnlocked > character.perk_points
        ? { perk_points: perkPointsUnlocked }
        : { perk_points: perkPointsUnlocked - 1 };

    characterMutate(patch_data);
  };

  const handleMouseMove = (e) => {
    setMagnifierPos({ x: e.clientX + 15, y: e.clientY + 15 });
  };

  const handleMagnifierHover = (state, image) => {
    setMagnifierState(state);
    setMagnifierImage(image);
  };

  const findPerkIcons = (perkName) => {
    /**matching anything inside square brackets (ie [perk_icon]). Then breaking out the perk name into an array with each word as it's own item. Then finding the perk code and replacing
    it with an image object, referencing the PNG and building that into a new array*/
    const perkIconPattern = /\[(.*?)\]/; // match [perk_icon]
    const perkNameArray = perkName.split(" ").map((p, index) => {
      const match = p.match(perkIconPattern); //If pattern matches, return an image object
      if (match) {
        const perkIcon = match[1];
        return (
          <img
            key={index}
            src={`/cards/${perkIcon}.png`}
            alt={perkIcon}
            className="perk-icon"
            onMouseEnter={() =>
              handleMagnifierHover(true, `/cards/${perkIcon}.png`)
            }
            onMouseLeave={() => handleMagnifierHover(false, null)}
            onMouseMove={handleMouseMove}
          />
        );
      }
      return p + " "; //otherwise, return the word and add a space
    });
    return perkNameArray; // return the new array
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Oops: {String(error.message || error)}</p>;

  return (
    <div className="mainCharWrapper">
      {/** Display character name and class from the set character details fetched previously. */}
      <h1 className="charName">
        {character.name}
        <br />{" "}
      </h1>
      <div className="secondaryCharWrapper">
        {/** Adjust XP and/or gold */}
        <div className="charInfoDiv">
          <div className="nameplateDiv">
            <img
              className="nameplate"
              src={charNameplate}
              alt={charNameplate}
            />
          </div>
          <div className="charInnerWrapper">
            <div className="nameplateDiv">
              <img
                className="nameplate"
                src={charPortrait}
                alt={charPortrait}
              />
            </div>
            <div className="charInputWrapper">
              <div className="charInputDiv">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    characterMutate(formData);
                  }}
                >
                  <div className="levelDiv">Level {character.level}</div>
                  <div>
                    <div className="charInputInnerDiv">XP</div>
                    <div className="charInputInnerDiv">
                      <input
                        className="inputNum"
                        type="number"
                        name="xp"
                        value={formData.xp}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="charInputInnerDiv">Gold </div>
                    <div className="charInputInnerDiv">
                      <input
                        className="inputNum"
                        type="number"
                        name="gold"
                        value={formData.gold}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <button className="charStatsButton" type="submit">
                    Save
                  </button>
                </form>
              </div>
              <div className="retireCharDiv">
                <BasicDialog
                  button="Retire Character"
                  title="Retire Character"
                  content="Are you sure you want to retire this character?"
                  onConfirm={async () => {
                    await deleteCharacterMutate(character.id);
                    navigate("/");
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/** Here's your list of perks*/}
        <div className="perksDiv">
          <ul className="perk-list">
            <h2 className="perkTitle">Perks</h2>
            {/** getting into some JSX looping madness here to display the perk checkboxs*/}
            {charClass?.map(
              (
                perk, //use .map to loop through list of perk dictionaries.
              ) => (
                <li key={perk.perk_id}>
                  <div>
                    {Array.from({ length: perk.times_unlockable }).map(
                      (_, i) => {
                        const checkboxId = i + 1;
                        const isChecked = selectedPerks.some(
                          (p) =>
                            p.perk_id === perk.perk_id &&
                            p.checkbox_id === checkboxId,
                        );
                        const firstChecked = selectedPerks.some(
                          (p) =>
                            p.perk_id === perk.perk_id && p.checkbox_id === 1,
                        );

                        return (
                          <input
                            type="checkbox"
                            key={`${perk.perk_id}-${checkboxId}`}
                            checked={isChecked}
                            onChange={(e) =>
                              handleCheckboxChange(
                                perk.perk_id,
                                checkboxId,
                                isChecked,
                              )
                            }
                            disabled={i === 1 && !firstChecked} // disable 2nd if 1st not unlocked
                          />
                        );
                      },
                    )}
                  </div>

                  <div>{findPerkIcons(perk.perk_name)}</div>
                  {magnifierState &&
                    createPortal(
                      //Create portal attaches the element to the specified part of the doc (in this case, body)
                      <img
                        src={magnifierImage}
                        className="magnifierImage"
                        style={{
                          top: `${magnifierPos.y}px`,
                          left: `${magnifierPos.x}px`,
                        }}
                      />,
                      document.body,
                    )}
                </li>
              ),
            )}
          </ul>
          <div className="perkPointsDiv">
            <h2 className="charName">Perk Points</h2>
            <div>
              {Array.from({ length: 18 }).map(
                (
                  _,
                  i, //generate 18 checkboxes for perk points
                ) => (
                  <React.Fragment key={i + 1}>
                    <input
                      type="checkbox"
                      checked={i < character.perk_points} //check any box id that is one less than characters perk points (checkbox id starts at 0, so if 1 perk point is unlocked, 0 should be checked)
                      onChange={(e) => handleCheckboxChangePP(i + 1)} //if a box is checked or unchecked, handle change
                      disabled={
                        (i + 1 != 1 && i > character.perk_points) ||
                        i < character.perk_points - 1
                      } //checkbox 0 should never be disabled. also, disable checkbox two away from number of perk points character has
                    />

                    {(i + 1) % 3 === 0 && (
                      <>
                        ✓<br />{" "}
                      </>
                    )}
                  </React.Fragment>
                ), // have to use fragment here because we are returning two things in the array
              )}
            </div>
          </div>
        </div>
      </div>
      {/** just handling creation of notes here. */}
      <div className="notesDiv">
        <h3 className="locationH3">Notes</h3>
        {/** displaying notes and allowing user to delete */}
        <div className="innerNotesDive">
          {characterNotes.map((note) => (
            <div className="notes" key={note.id}>
              {note.text}{" "}
              <button
                className="deleteButton"
                onClick={() => deleteNoteMutate(note.id)}
              >
                X
              </button>
              <br />
              <span className="timestamp">{note.timestamp}</span>
            </div>
          ))}
        </div>

        <div className="inputTextNotesDiv">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createNoteMutate({ text: noteText });
              setNoteText("");
            }}
          >
            <input
              className="inputTextNotes"
              type="text"
              name="note_text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button type="submit">Save</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CharacterDetails;
