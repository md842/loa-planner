import {useState} from 'react';

import {CharacterCard} from '../components/CharacterCard';
import {type Character} from '../components/core/types';
import {addChar, delChar, loadChars} from '../components/core/character-data';

import Button from 'react-bootstrap/Button';

export default function Home(){
  const [chars, setChars] = useState(loadChars); // Load characters into state

  function handleDelete(index: number){
    setChars(delChar(index));
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
                handleDelete: handleDelete
              }
            }
          />
        );
      })}
      <Button className="d-block mx-auto" variant="primary" onClick={() => setChars(addChar())}>
        Add Character
      </Button>
    </main>
	);
}