import {CharacterCard} from '../components/CharacterCard';
import {type Character, loadChars} from '../components/Core';

export default function Home(){
  let chars: Character[] = loadChars(); // Load all characters

	return(
    <main className="home">
      {chars.map((char: Character) => { /* Create card for each character */
        return <CharacterCard {...char}/>
      })}
    </main>
	);
}