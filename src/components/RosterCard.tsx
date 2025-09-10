import {type ChangeEvent, type JSX, useEffect, useState} from 'react';

import {TableHeader} from './tables/TableHeader';
import {RosterGoalTable} from './tables/RosterGoalTable';
import {RemTable} from './tables/RemTable';

import {type Character, type Goal, type Materials, addMaterials, initMaterials, subMaterials, type RosterGoal} from './core/types';
import {getRosterGoals, setRosterGoals} from './core/character-data';
import {loadRosterMats} from './core/roster-storage';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

/** Props interface for RosterTable. */
interface RosterCardProps{
  chars: Character[];
  // References to parent component state/state setters
  goalsUpdateSignal: unknown[];
  remUpdateSignal: unknown[];
  setOnTop: React.Dispatch<React.SetStateAction<boolean>>;
}

// Initialized by calcTableGoals(), used by initGoals and initRem
var tableGoals: Goal[];
var remTableGoals: Goal[];

/** Constructs the table for the roster goals. */
export function RosterCard(props: RosterCardProps): JSX.Element{
  let {chars, goalsUpdateSignal, remUpdateSignal, setOnTop} = props; // Unpack props

  /* Table state variables. useEffect runs once on mount, so initialize state
     with empty fragments to avoid wasting initial renders. */
  const [goalsTable, setGoals] = useState(<></>);
  const [remTable, setRem] = useState(<></>);

  const [modalVis, setModalVis] = useState(false); // SettingsModal visibility

  useEffect(() => { // Re-initializes goalsTable state when signal changes
    setGoals(initGoals); // Update goals table
  }, [goalsUpdateSignal]);

  useEffect(() => { // Re-initializes remTable state when signal changes
    setRem(initRem); // Update remaining materials table(s)
  }, [remUpdateSignal]);


  /** Calculates table goals for RosterCard given saved roster goal data. */
  function calculateTableGoals(){
    let rosterGoals: RosterGoal[] = getRosterGoals();
    tableGoals = [], remTableGoals = []; // Initialize table goal arrays

    rosterGoals.forEach((rosterGoal: RosterGoal) => {
      // Calculate a tableGoal and remTableGoal for each roster goal
      let tableGoal: Goal = {name: rosterGoal.name, mats: initMaterials()};
      let remTableGoal: Goal = {name: rosterGoal.name, mats: initMaterials()};

      rosterGoal.goals.forEach((charGoals: boolean[], charIndex: number) => {
        /* For each character, determine the remaining bound materials required
           to finish all the character goals included in this rosterGoal. */
        let charRemBound: Materials = initMaterials();

        charGoals.forEach((goalIncluded: boolean, goalIndex: number) => {
          if (goalIncluded){
            // Accumulate all characters' included goals in tableGoal.mats
            tableGoal.mats = addMaterials(tableGoal.mats, chars[charIndex].goals[goalIndex].mats);
            // Accumulate current character's included goals in charRemBound
            charRemBound = addMaterials(charRemBound, chars[charIndex].goals[goalIndex].mats);
          }
        });
        /* Subtract current char's bound materials from the sum of its included
           goals. Fine if no char goals included, subMaterials floors to 0. */
        charRemBound = subMaterials(charRemBound, chars[charIndex].boundMats);
        // Add charRemBound to the remTableGoal for this rosterGoal.
        remTableGoal.mats = addMaterials(remTableGoal.mats, charRemBound);
      });
      // Finally, subtract roster mats from the sum of all charRemBounds.
      remTableGoal.mats = subMaterials(remTableGoal.mats, loadRosterMats());

      tableGoals.push(tableGoal); // Push completed tableGoal
      remTableGoals.push(remTableGoal); // Push completed remTableGoal
    });
  } /* Must be called in both initGoals and initRem because MatsTable can call
       initRem without calling initGoal. */

  // Table state initializer functions
  function initGoals(): JSX.Element{
    calculateTableGoals(); // Re-calculate table goals
    return RosterGoalTable({
      goals: tableGoals,
      setGoals: () => setGoals(initGoals),
      setRem: () => setRem(initRem)
    });
  }
  function initRem(): JSX.Element{
    calculateTableGoals(); // Re-calculate table goals
    return RemTable({
      goals: remTableGoals
    });
  }

  function SettingsModal(){
    let rosterGoals: RosterGoal[] = getRosterGoals();
    const [curGoal, setCurGoal] = useState(0); // Controlled by dropdown
    const [temp] = useState(initTemp); // Stores uncommitted changes

    function initTemp(): RosterGoal[]{ // temp state initializer function
      return JSON.parse(JSON.stringify(rosterGoals)); // Deep copy rosterGoals
    }

    function GoalCheckboxes(props: {goals: Goal[], charIndex: number}): JSX.Element{
      /* Separating checkbox rendering into its own component function allows
         defaultChecked to update when changing selected roster goal. */
      return(
        <>
          {props.goals.map((goal: Goal, goalIndex: number) => {
            return(<Form.Check
              className="mb-3"
              style={{overflowWrap: "anywhere"} /* Long names wrap to new line */}
              key={goal.name + goalIndex}
              type="checkbox"
              label={goal.name}
              defaultChecked={temp[curGoal].goals[props.charIndex][goalIndex]}
              onChange={(e) => handleChange(e, props.charIndex, goalIndex)}
            />);
          })}
        </>
      );
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>, charIndex: number, goalIndex: number){
      // Called when checkbox is clicked. Directly manipulates booleans in temp
      temp[curGoal].goals[charIndex][goalIndex] = e.target.checked;
    }
  
    function handleSubmit(){
      // Called when "Save" button is clicked
      setRosterGoals(temp); // Commit changes in temp to rosterGoals
      setGoals(initGoals); // Update goals table
      setRem(initRem); // Update remaining materials table(s)
      setModalVis(false); // Close modal
    }

    return(
      <Modal size="lg" show={modalVis} centered>
        <Modal.Header>
          <Modal.Title>Roster Goal Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon3">Select a roster goal to edit:</InputGroup.Text>
            <Form.Select
              defaultValue={0}
              onChange={(e) => {setCurGoal(Number(e.target.value))}}
            >
              { /* Populate dropdown with roster goal names */
              rosterGoals.map((goal: RosterGoal, index: number) => {
                return(<option key={index} value={index}>{goal.name}</option>);
              })}
            </Form.Select>
          </InputGroup>
          <h6 className="mb-4">Select character goals to include in the selected roster goal:</h6>
          <div className="d-flex flex-wrap">
            { /* Populate dropdown with character names and corresponding goals */
            chars.map((char: Character, charIndex: number) => {
              return(<div className="mb-3 w-25" key={char.name + charIndex}>
                <h6 className="mb-3">{char.name}</h6>
                <GoalCheckboxes goals={char.goals} charIndex={charIndex}/>
              </div>);
            })}
          </div>
          <Form onSubmit={handleSubmit}>
            <Button variant="primary" type="submit">Save</Button>
            <Button variant="primary" onClick={() => setModalVis(false)}>Cancel</Button>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  return(
    <div style={{"--table-color": "#777"} as React.CSSProperties}>
      <SettingsModal/> {/* Hidden until setModalVis(true) onClick*/}
      <div className="settings-tab">
        <Button variant="link" onClick={() => setModalVis(true)}>
          <i className="bi bi-gear-fill"/>
        </Button>
        <Button variant="link" onClick={() => setOnTop(true)}>
          <i className="bi bi-chevron-up"/>
        </Button>
        <Button variant="link" onClick={() => setOnTop(false)}>
          <i className="bi bi-chevron-down"/>
        </Button>
      </div>
      <Table hover>
        <TableHeader title={<th>Roster Goals</th>}/>
        <tbody>
          {goalsTable}
          {remTable}
        </tbody>
      </Table>
    </div>
  );
}