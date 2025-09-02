import {useState} from 'react';

import {type Character} from '../components/core/types';
import {addChar, loadChars} from '../components/core/character-data';

import {CharacterCard} from '../components/CharacterCard';

import Button from 'react-bootstrap/Button';

export default function Home(){
  const [chars, setChars] = useState(loadChars); // Load characters into state

	return(
    <main>
      {chars.map((char: Character) => { /* Create card for each character */
        return <CharacterCard key={char.index} {...char}/>
      })}
      <Button className="d-block mx-auto" variant="primary" onClick={() => setChars(addChar())}>
        Add Character
      </Button>
    </main>
	);
}