import {useState} from 'react';

import {RosterCard} from './cards/RosterCard';
import {CharacterCard} from './cards/CharacterCard';
import {PlannerTutorialModal} from '../tutorials/PlannerTutorial';
import {type Character} from '../core/types';
import {addChar, delChar, getChars, swapChar} from '../core/character-data';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

export function RosterView(){
  const [chars, setChars] = useState(getChars); // Load characters into state
  const [rosterOnTop, setRosterOnTop] = useState(true); // RosterCard position

  const [modalVis, setModalVis] = useState(false); // PlannerTutorialModal visibility
  
  /* Roster state update signals; uses array signal type because
     sendSignal([]) is guaranteed to update state with a new value. */
  const [rosterGoalUpdateSignal, sendRosterGoalUpdateSignal] = useState([]);
  const [rosterRemUpdateSignal, sendRosterRemUpdateSignal] = useState([]);

  // Character operation handlers
  function handleAddChar(){ // Called when "Add Character" button is clicked
    if (addChar()) // May not succeed if character limit is reached
      setChars([...getChars()]); // Update state and re-render if add succeeds
  }
  function handleDeleteChar(index: number){
    // Called when a trash button associated with a CharacterCard is clicked
    delChar(index); // Always succeeds, no delete button if no char exists
    setChars([...getChars()]); // Always update state and re-render
  }
  function handleSwapChar(index: number, direction: number){
    // Called when an up/down button associated with a CharacterCard is clicked
    // May not succeed if swapping first character up or last character down
    if (swapChar(index, direction))
      setChars([...getChars()]); // Update state and re-render if swap succeeds
  }

	return(
    <>
      <PlannerTutorialModal defaultActiveKey="1" modalVis={modalVis} setModalVis={setModalVis}/>
      <Container fluid="md">
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
        <div className="text-center">
          {(chars.length < 12) && /* Hide button if character limit reached */
            <Button className="mx-1" variant="primary" onClick={handleAddChar}>
              Add Character
            </Button>}
          <Button className="mx-1" variant="primary"
            href="https://maxroll.gg/lost-ark/upgrade-calculator"
            target="_blank"
          >
            Open Maxroll Upgrade Calculator &nbsp;<i className="bi bi-box-arrow-up-right"/>
          </Button>
          <Button className="mx-1" variant="primary"
            onClick={() => setModalVis(true)}
          >
            Show Help
          </Button>
        </div>
      </Container>
    </>
	);
}