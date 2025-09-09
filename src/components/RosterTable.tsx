import {type ChangeEvent, type JSX, type RefObject, useRef, useState} from 'react';

import {TableHeader} from './tables/TableHeader';
import {RosterGoalTable} from './tables/RosterGoalTable';
import {RemTable} from './tables/RemTable';

import {type Character, type Goal, type RosterGoal, type Materials, addMaterials, initMaterials, subMaterials} from './core/types';
import {getRosterGoals, saveRosterGoals} from './core/character-data';
import {loadRosterMats} from './core/roster-storage';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

/** Props interface for RosterTable. */
interface RosterTableProps{
  chars: Character[];
}

var rosterGoals: RosterGoal[] = [];
let goals: Goal[] = []; // Build table goals from rosterGoals

/** Constructs the table for the roster goals. */
export function RosterTable(props: RosterTableProps): JSX.Element{
  let {chars} = props; // Unpack props

  const [modalVis, setModalVis] = useState(false); // SettingsModal visibility

  // Refs used in RemTable
  const goalsTotal: RefObject<Goal> = useRef({name: "Total", mats: initMaterials()}); // Currently unused
  const matsTotal: RefObject<Materials> = useRef(initMaterials()); // Currently unused

  // Set up table state variables
  function initGoals(){
    rosterGoals = getRosterGoals();
    goals = []; // Build table goals from rosterGoals

    rosterGoals.forEach((rosterGoal: RosterGoal) => {
      // Build a Goal object for each roster goal
      let goal: Goal = {name: rosterGoal.name, mats: initMaterials()};

      rosterGoal.goals.forEach((charGoals: boolean[], charIndex: number) => {
        // Get indices of goals to include for each char (chars[charIndex])
        charGoals.forEach((goalIncluded: boolean, goalIndex: number) => {
          // Add specified goal mats to table goal for this roster goal
          if (goalIncluded)
            goal.mats = addMaterials(goal.mats, chars[charIndex].goals[goalIndex].mats);
        });
      });
      goals.push(goal); // Push Goal object for this roster goal to table params
    });
    return RosterGoalTable({goals: goals, setGoals: () => setGoals(initGoals), setRem: () => setRem(initRem)});
  }

  function initRem(){
    let remGoals: Goal[] = []; // Build table goals from rosterGoals

    rosterGoals.forEach((rosterGoal: RosterGoal, index: number) => {
      // Build a Goal object for each roster goal
      let goal: Goal = {name: rosterGoal.name, mats: initMaterials()};

      // Copy mats from goal built in initGoals() and subtract roster mats
      goal.mats = subMaterials(goals[index].mats, loadRosterMats());

      rosterGoal.goals.forEach((charGoals: boolean[], charIndex: number) => {
        if (charGoals.includes(true)) // Char charIndex is part of this roster goal
          // Subtract the character's bound mats from the goal
          goal.mats = subMaterials(goal.mats, chars[charIndex].boundMats);
      });
      remGoals.push(goal); // Push Goal object for this roster goal to table params
    });
    
    return RemTable({goals: remGoals, goalsTotalRef: goalsTotal, matsTotalRef: matsTotal});
  }
  
  // Table state variables
  const [goalsTable, setGoals] = useState(initGoals);
  const [remTable, setRem] = useState(initRem);


  function SettingsModal(){
    const [curGoal, setCurGoal] = useState(0); // Controlled by dropdown
    rosterGoals = getRosterGoals(); // Ensure rosterGoals value is up-to-date

    function GoalCheckboxes(props: {char: Character, charIndex: number}): JSX.Element{
      /* Separating checkbox rendering into its own component function allows
         defaultChecked to update when changing selected roster goal. */
      return(
        <>
          {props.char.goals.map((goal: Goal, goalIndex: number) => {
            return(<Form.Check
              className="mb-3"
              key={goal.name}
              type="checkbox"
              label={goal.name}
              defaultChecked={rosterGoals[curGoal].goals[props.charIndex][goalIndex]}
              onChange={(e) => handleChange(e, props.charIndex, goalIndex)}
            />);
          })}
        </>
      );
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>, charIndex: number, goalIndex: number){
      // Checkboxes directly manipulate boolean values in rosterGoals
      rosterGoals[curGoal].goals[charIndex][goalIndex] = e.target.checked;
      saveRosterGoals();
    }
  
    function handleSubmit(){
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
          <h6 className="mb-3">Select goals to include in this roster goal:</h6>
          <div className="d-flex">
            { /* Populate dropdown with character names and corresponding goals */
            chars.map((char: Character, charIndex: number) => {
              return(<div className="mx-3" key={char.name}>
                <h6 className="mb-3">{char.name}</h6>
                <GoalCheckboxes char={char} charIndex={charIndex}/>
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
        <Button variant="link">
          <i className="bi bi-chevron-up"/>
        </Button>
        <Button variant="link">
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