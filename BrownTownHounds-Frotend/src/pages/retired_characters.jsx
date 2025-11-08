import '../styles/retired_characters.css';
import { useRetiredCharacters } from "../api/characters.query.js";

function RetiredCharacters (){
    const { data: retiredChars, isLoading, error, isSuccess } = useRetiredCharacters()

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Oops: {String(error.message || error)}</p>;

    return (
        <div className="retiredCharactersMainWrapper">
            <h1 className='partyName'>Retired Characters</h1>
            <div className ="retiredCharactersDiv">
                {retiredChars.map(retiredChar => (
                        <ul className="retiredCharList" key={retiredChar.id}>
                            <h2 className="retiredCharName">{retiredChar.name}</h2>
                            <li>Class: {retiredChar.class}</li>
                            <li>Level: {retiredChar.level}</li>
                            <li>Gold: {retiredChar.gold}</li>
                        </ul>
                ))}
            </div>
        </div>
    )   
}

export default RetiredCharacters