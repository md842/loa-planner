import {useState} from 'react';

import {CharacterCard} from '../components/CharacterCard';
import {type Character} from '../components/core/types';
import {addChar, delChar, getChars, loadChars, swapChar} from '../components/core/character-data';

import Button from 'react-bootstrap/Button';

export default function Home(){
  const [chars, setChars] = useState(loadChars); // Load characters into state

  function handleAdd(){
    if (addChar()) // May not succeed if character limit is reached 
      setChars(getChars()); // Update state and re-render only if add succeeds
  }

  function handleDelete(index: number){
    delChar(index); // Always succeeds, delete button is tied to CharacterCard existing
    setChars(getChars()); // Always update state and re-render
  }

  function handleSwap(index: number, direction: number){
    // May not succeed if swapping first character up or last character down
    if (swapChar(index, direction))
      setChars(getChars()); // Update state and re-render only if swap succeeds
  }

	return(
    <main>
      {chars.map((char: Character, index: number) => {
        return( /* Create card for each character */
          <CharacterCard
            key={char.name + index}
            {...
              {
                char: char,
                index: index,
                handleDelete: handleDelete,
                handleSwap: handleSwap,
              }
            }
          />
        );
      })}
      <Button className="d-block mx-auto" variant="primary" onClick={handleAdd}>
        Add Character
      </Button>
    </main>
	);
}