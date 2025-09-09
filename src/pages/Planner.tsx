import '../components/tables/common.css';
import '../components/SettingsTab.css';

import {useState} from 'react';

import {RosterCard} from '../components/RosterCard';
import {CharacterCard} from '../components/CharacterCard';
import {type Character} from '../components/core/types';
import {addChar, delChar, getChars, swapChar} from '../components/core/character-data';

import Button from 'react-bootstrap/Button';

export default function Home(){
  const [chars, setChars] = useState(getChars); // Load characters into state
  const [rosterOnTop, setRosterOnTop] = useState(true);

  function handleAddChar(){
    if (addChar()) // May not succeed if character limit is reached
      setChars(getChars); // Update state and re-render only if add succeeds
  }

  function handleDeleteChar(index: number){
    delChar(index); // Always succeeds, delete button is tied to CharacterCard existing
    setChars(getChars); // Always update state and re-render
  }

  function handleSwapChar(index: number, direction: number){
    // May not succeed if swapping first character up or last character down
    if (swapChar(index, direction))
      setChars(getChars); // Update state and re-render only if swap succeeds
  }

	return(
    <main>
      {rosterOnTop && /* Render RosterCard above CharacterCards */
        <RosterCard chars={chars} setRosterOnTop={setRosterOnTop}/>}
      {chars.map((char: Character, index: number) => {
        return( /* Create table for each character */
          <CharacterCard
            key={char.name + index}
            {...
              {
                char: char,
                index: index,
                handleDelete: handleDeleteChar,
                handleSwap: handleSwapChar,
              }
            }
          />
        );
      })}
      {!rosterOnTop && /* Render RosterCard below CharacterCards */
        <RosterCard chars={chars} setRosterOnTop={setRosterOnTop}/>}
      {(chars.length < 10) && /* Hide button if character limit reached */
        <Button className="d-block mx-auto" variant="primary" onClick={handleAddChar}>
          Add Character
        </Button>}
    </main>
	);
}