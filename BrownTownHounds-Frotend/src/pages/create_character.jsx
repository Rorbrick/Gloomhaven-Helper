// Create Character Menu
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/create_character.css';
import { useClasses } from '../api/classes.query.js';
import { useCreateCharacter } from "../api/characters.query.js";

function CreateCharacter (){
  //Api hook for classes
  const { data: classes, isLoading: classIsLoading, error: classError, isSuccess: classIsSuccess } = useClasses();

  //api hook to create character
  const { isLoading: createCharacterIsLoading, isError, error: createCharacterError, isSuccess: createCharacterIsSuccess, mutate } = useCreateCharacter();

  const isLoading = classIsLoading ||  createCharacterIsLoading;
  const error = classError || createCharacterError;
  const isSuccess = classIsSuccess || createCharacterIsSuccess;

  //misc
  const [selectedClass,setSelectedClass] = useState(""); 
  const [formData,setFormData] = useState("");
  const [charCard,setCharCard] = useState(null);
  const [charCardBack,setCharCardBack] = useState(null);
  const navigate = useNavigate();

  //On page load, if classes data is loaded, set default values - selected class, and card images
  useEffect(() => {
    if (isSuccess && classes) {
      setSelectedClass(classes[0]);
      setCharCard('/public/images/gh-' + classes[0].class_name + '.png');
      setCharCardBack('/public/images/gh-' + classes[0].class_name + '-back.png');
    }
  }, [isSuccess, classes]);

  //Any time we change data, such as character name or selected class, update values
  const handleChange = (e) =>   {
    const { name, value, type } = e.target;

    if (type === "text") {
      setFormData((prevFormData) => ({...prevFormData,[name]: value}));
    } else {
      setSelectedClass(value);
      setCharCard('/public/images/gh-' + classes[value-1].class_name + '.png');
      setCharCardBack('/public/images/gh-' + classes[value-1].class_name + '-back.png');
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Oops: {String(error.message || error)}</p>;

return (
    <div className="createCharMainWrapper">
    <h1 className="partyName">Create Character</h1>
      <div className="createCharInnerWrapper">
        <div className="createCharInputDiv">
          <form onSubmit={() => mutate({ character_name: formData.character_name, class_id: selectedClass })}>
            <>Name &nbsp;</> 
            <input className="inputText" type="text" name="character_name" value={formData.location} onChange={handleChange} /><br />
            <label>
            <>Classes &nbsp;</>
            <select name="Class" value={selectedClass} onChange={handleChange}>
                {classes?.map((cls) => (<option key={cls.id} value={cls.id}>{cls.class_name}</option>))}
            </select>
            </label><br />
          <button className="saveButton" type="submit">Create</button>
          </form>
        </div>
      </div>
      <div className='charCardWrapper'>
        <div className="charCardDiv">
          <img className="nameplate" src={charCard} alt={charCard} />
        </div>
        <div className="charCardDiv">
          <img className="nameplate" src={charCardBack} alt={charCardBack} />
        </div> 
      </div>
    </div>
)
}

export default CreateCharacter;