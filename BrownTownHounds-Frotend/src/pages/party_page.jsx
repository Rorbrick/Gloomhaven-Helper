import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import '../styles/party.css';
import { useParty, useUpdateParty, usePartyNotes, useCreatePartyNote, useDeletePartyNote, useCreatePartyAchievement, usePartyAchievements } from '../api/parties.query';

function PartyDetails() {
    const { id } = useParams();

    //Party
    const { data: party, isLoading: isPartyLoading, error: PartyError, isSuccess } = useParty(id);
    const { isLoading: isPartyUpdateLoading, error: partyUpdateError, mutate: partyMutate } = useUpdateParty(id);
    const { data: partyNotes, isLoading: isPartyNotesLoading, error: partyNotesError } = usePartyNotes(id);
    const { isLoading: createPartyNoteIsLoading, error: createPartyNoteError, mutate: createNoteMutate } = useCreatePartyNote(id);
    const { isLoading: createPartyAchievementIsLoading, error: createPartyAchievementError, mutate: createAchievementMutate } = useCreatePartyAchievement(id);
    const { isLoading: deletePartyNoteIsLoading, error: deletePartyNoteError, mutate: deleteNoteMutate } = useDeletePartyNote(id);
    const { data: partyAchievements, isLoading: partyAchievementsIsLoading, error: partyAchievementsError } = usePartyAchievements(id);

    //Checkers - loading and errors
    const isLoading =  isPartyLoading || isPartyUpdateLoading || isPartyNotesLoading || createPartyNoteIsLoading || deletePartyNoteIsLoading || partyAchievementsIsLoading || createPartyAchievementIsLoading;
    const error =  PartyError || partyUpdateError || partyNotesError || createPartyNoteError || deletePartyNoteError || partyAchievementsError || createPartyAchievementError;

    //Additional useStates
    const [formData,setFormData] = useState("");
    const [achievementText,setAchievementText] = useState("");
    const [noteText,setNoteText] = useState("");
    const [slideValue,setSlideValue] = useState(0);

    
    //Set slider data once party has been loaded
    useEffect(() => {
        if(isSuccess && party){
            setSlideValue(party.reputation)
        }
    }, [isSuccess],[party]);


  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Oops: {String(error.message || error)}</p>;


return (
    <div className='mainWrapper'>
        <div className='mainWrapperContainer'>
            <h1 className='partyName'>{party.name}</h1>
            <div className='partyDiv'>
                <div className='locationContainer'>
                    <h3 className='locationH3'>Current Location</h3>
                    <div className='locationSpan'>{party.location}</div>
                    <div className="inputTextLocation">
                        <form onSubmit={(e) => {e.preventDefault();
                                                partyMutate({ location: formData });}}>
                        <input type="text" name="location" value={formData} onChange={(e) => setFormData(e.target.value)}/> <button type='submit'>Update</button>
                        </form>
                    </div>
                </div>

                <div className="achievementDiv">
                    <h3 className='locationH3'>Achievements</h3>
                    <div className="achievementsListDiv">
                        <ul className="achievementsList">
                        {partyAchievements.map(achievement => (
                            <li key={achievement.id}>{achievement.text}</li>
                        ))}
                        </ul>
                    </div>

                    <div className="inputTextAchievement">
                        <form onSubmit={(e) => {e.preventDefault();
                                                createAchievementMutate({ text: achievementText });
                                                setAchievementText("");}}>
                        <input type="text" name="achievement" value={achievementText} onChange={(e) => setAchievementText(e.target.value)}/> <button type='submit'>Add</button>
                        </form>                            
                    </div>                        
                </div>
            </div>

            <div className='notesDiv'>
                <h3 className='locationH3'>Notes</h3>
                {partyNotes.map(note => (
                    <div className='notes' key={note.id}>
                        {note.text} <button className='deleteButton' onClick={() => deleteNoteMutate(note.id)}>X</button> <br/>
                        <span className="timestamp">{note.timestamp}</span><br/>
                    </div>
                ))}
                <div className="inputTextNotesDiv">
                    <form onSubmit={(e) => {e.preventDefault();
                                            createNoteMutate({ text:noteText });
                                            setNoteText('');}}>
                        <input className="inputTextNotes" type="text" name="note" value={noteText} onChange={(e) => setNoteText(e.target.value)}/> <button type='submit'>Post</button><br/>
                    </form>
                </div>
            </div>
        </div>
        <div className='sliderWrapper'>
            <input type="range" 
            className='slider'
            min="-20" 
            max="20"
            onChange={(e) => {setSlideValue(e.target.value)
                              partyMutate({ reputation:Number(e.target.value) });}} 
            value={slideValue}
            />

            <div className="imageWrapper">
                <img className="rep" src="/textures/Party-Sheet.png" alt="Party Sheet" />
            </div>
        </div>
    </div>
)
}

export default PartyDetails