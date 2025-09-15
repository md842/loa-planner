import {useState} from 'react';

import {RosterCard} from '../../components/planner/RosterCard';
import {CharacterCard} from '../../components/planner/CharacterCard';
import {type Character} from '../../components/core/types';
import {addChar, delChar, getChars, swapChar} from '../../components/core/character-data';

import Button from 'react-bootstrap/Button';

export function RosterView(){
  const [chars, setChars] = useState(getChars); // Load characters into state
  const [rosterOnTop, setRosterOnTop] = useState(true); // RosterCard position
  
  /* Roster state update signals; uses array signal type because
     sendSignal([]) is guaranteed to update state with a new value. */
  const [rosterGoalUpdateSignal, sendRosterGoalUpdateSignal] = useState([]);
  const [rosterRemUpdateSignal, sendRosterRemUpdateSignal] = useState([]);

  // Character operation handlers
  function handleAddChar(){ // Called when "Add Character" button is clicked
    if (addChar()) // May not succeed if character limit is reached
      setChars(getChars); // Update state and re-render only if add succeeds
  }
  function handleDeleteChar(index: number){
    // Called when a trash button associated with a CharacterCard is clicked
    delChar(index); // Always succeeds, no delete button if no char exists
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
          rosterGoalUpdateSignal={rosterGoalUpdateSignal}
          rosterRemUpdateSignal={rosterRemUpdateSignal}
          setOnTop={setRosterOnTop}
          updateRosterGoals={() => sendRosterGoalUpdateSignal([])}
          updateRosterRem={() => sendRosterRemUpdateSignal([])}
        />}
      {chars.map((char: Character, index: number) => {
        return( /* Render a CharacterCard for each character. */
          <CharacterCard
            key={char.name + index}
            char={char}
            index={index}
            handleDelete={handleDeleteChar}
            handleSwap={handleSwapChar}
            updateRosterGoals={() => sendRosterGoalUpdateSignal([])}
            updateRosterRem={() => sendRosterRemUpdateSignal([])}
          />
        );
      })}
      {!rosterOnTop && /* If false, render RosterCard below CharacterCards. */
        <RosterCard
          chars={chars}
          rosterGoalUpdateSignal={rosterGoalUpdateSignal}
          rosterRemUpdateSignal={rosterRemUpdateSignal}
          setOnTop={setRosterOnTop}
          updateRosterGoals={() => sendRosterGoalUpdateSignal([])}
          updateRosterRem={() => sendRosterRemUpdateSignal([])}
        />}
      {(chars.length < 10) && /* Hide button if character limit reached */
        <Button className="d-block mx-auto" variant="primary" onClick={handleAddChar}>
          Add Character
        </Button>}
    </main>
	);
}