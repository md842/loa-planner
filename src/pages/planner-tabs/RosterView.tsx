import {useState} from 'react';

import {RosterCard} from '../../components/planner/RosterCard';
import {CharacterCard} from '../../components/planner/CharacterCard';
import {type Character} from '../../components/core/types';
import {addChar, delChar, getChars, swapChar} from '../../components/core/character-data';

import Button from 'react-bootstrap/Button';

export function RosterView(){
  const [chars, setChars] = useState(getChars); // Load characters into state
  const [rosterOnTop, setRosterOnTop] = useState(true);
  /* unknown[] is chosen as a reliable signal type because calls to
     sendSignal([]) are guaranteed to update state with a new value. */
  const [goalsUpdateSignal, sendGoalsSignal] = useState([]);
  const [remUpdateSignal, sendRemSignal] = useState([]);

  // Character operation handlers
  function handleAddChar(){ // Called when "Add Character" button is clicked
    if (addChar()) // May not succeed if character limit is reached
      setChars(getChars); // Update state and re-render only if add succeeds
  }
  function handleDeleteChar(index: number){
    // Called when a trash button associated with a CharacterCard is clicked
    delChar(index); // Always succeeds, delete button is tied to CharacterCard existing
    setChars(getChars); // Always update state and re-render
  }
  function handleSwapChar(index: number, direction: number){
    // Called when an up/down button associated with a CharacterCard is clicked
    // May not succeed if swapping first character up or last character down
    if (swapChar(index, direction))
      setChars(getChars); // Update state and re-render only if swap succeeds
  }

	return(
    <main>
      {rosterOnTop && /* If true, render RosterCard above CharacterCards. */
        <RosterCard
          chars={chars}
          goalsUpdateSignal={goalsUpdateSignal}
          remUpdateSignal={remUpdateSignal}
          setOnTop={setRosterOnTop}
        />}
      {chars.map((char: Character, index: number) => {
        return( /* Render a CharacterCard for each character. */
          <CharacterCard
            key={char.name + index}
            char={char}
            index={index}
            handleDelete={handleDeleteChar}
            handleSwap={handleSwapChar}
            updateRosterGoals={() => sendGoalsSignal([])}
            updateRosterRem={() => sendRemSignal([])}
          />
        );
      })}
      {!rosterOnTop && /* If false, render RosterCard below CharacterCards. */
        <RosterCard
          chars={chars}
          goalsUpdateSignal={goalsUpdateSignal}
          remUpdateSignal={remUpdateSignal}
          setOnTop={setRosterOnTop}
        />}
      {(chars.length < 10) && /* Hide button if character limit reached */
        <Button className="d-block mx-auto" variant="primary" onClick={handleAddChar}>
          Add Character
        </Button>}
    </main>
	);
}