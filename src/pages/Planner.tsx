import {type Character} from '../components/core/types';
import {loadChars} from '../components/core/character-data';

import {CharacterCard} from '../components/CharacterCard';

export default function Home(){
  let chars: Character[] = loadChars(); // Load all characters

	return(
    <main className="home">
      {chars.map((char: Character) => { /* Create card for each character */
        return <CharacterCard key={char.name} {...char}/>
      })}
    </main>
	);
}