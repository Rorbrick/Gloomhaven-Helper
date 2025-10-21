// Create Character Menu
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/create_character.css';
import { useClasses } from '../api/classes.query.js';

function CreateCharacter (){
  //Api hook for classes
  const { data: classes, isLoading, error, isSuccess } = useClasses();

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

  //Create new character - send data to backend. Will clean this up with an optimistic update once it is built
  const handleSubmit = (e) => {
      e.preventDefault();

      const character = {
        character_name: formData.character_name,
        class_id: selectedClass
      };

      console.log("Submitting:", character);

      fetch(`http://127.0.0.1:5000/api/characters`, 
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(character)
      })

      .then(res => res.json())
      .then(data => {
        console.log("Saved:", data);
        navigate("/");
      })
      .catch(err => console.error("Error saving:", err));
    };

return (
    <div className="createCharMainWrapper">
    <h1 className="partyName">Create Character</h1>
      <div className="createCharInnerWrapper">
        <div className="createCharInputDiv">
          <form onSubmit={handleSubmit}>
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