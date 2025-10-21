import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { useState } from 'react'

export default function BasicListbox({ characters }) {
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);

  return (
    <Listbox value={selectedCharacter} onChange={setSelectedCharacter}>
      <ListboxButton>Characters</ListboxButton>
      <ListboxOptions anchor="bottom">
        {characters.map((character) => (
          <ListboxOption key={character.id} value={character} className="data-focus:bg-blue-100">
            {character.name}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}