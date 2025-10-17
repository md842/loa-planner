import {type ChangeEvent, type ReactNode, useEffect, useState} from 'react';

import {Cell} from '../../container-table/Cell';

import {type Goal, type Materials} from '../../core/types';
import {sanitizeInput} from './common';
import {goldValue} from '../../core/market-data';

import Row from 'react-bootstrap/Row';

// If true, changes will be committed by saveSources() on next onBlur event.
let changed: boolean = false;

/** Props interface for GoalRow. */
interface GoalRowProps{
  roster?: boolean; // If true, this row represents a roster goal.
  total?: boolean; // If true, this row represents a total goal.
  goal: Goal; // The Goal that this GoalRow is displaying.
  index: number; // The index of the Goal that this GoalRow is displaying.

  /* Helper function that checks for uniqueness of a goal name. Passed to 
     GoalRow as a prop because GoalRow only has data for its own goal. */
  goalNameUnique(name: string, ignoreIndex?: number): boolean;

  /** References to parent component state/state setters */
  // Signals to parent component to save uncommitted changes.
  setChanged(changed: boolean): void;
  // Wrapper for updating the target and total goal in parent component state
  setGoal(goalIndex: number, id?: string, key?: keyof Materials, value?: number): void;
}

// Generate a table row for the "Goals" section.
export function GoalRow(props: GoalRowProps): ReactNode{
  let {roster, total, goal, index, goalNameUnique,
       setChanged, setGoal} = props; // Unpack props
  let cells: ReactNode[] = []; // Initialize table row for this goal

  // State variables for controlled input fields, initialize with goal data
  const [id, setId] = useState(goal.id);
  const [mats, setMats] = useState(goal.mats);

  // Update signal handler
  useEffect(() => {
    setId(goal.id);
    setMats(goal.mats);
  }, [goal]); // Runs on mount and when goal changes

  function handleGoalMatChange(e: ChangeEvent<HTMLInputElement>, index: number, key: keyof Materials){
    if (sanitizeInput(e, goal.mats[key])){ // Valid numeric input
      setGoal(index, undefined, key, Number(e.target.value)); // Update goal data
      changed = true; // Character data will be saved on next focus out
    } // Reject non-numeric input outside of name field (do nothing)
  }

  function handleGoalNameChange(e: ChangeEvent<HTMLInputElement>, index: number){
    if (e.target.value.length < 30){ // Under length limit, accept input
      setGoal(index, e.target.value); // Update goal data
      changed = true; // Goal data will be saved on next focus out
    }
    else // Over length limit, reject input
      e.target.value = goal.id; // Resets field to last good value
  }

  /** Enforces goal naming rules when typing in GoalRow's goal name input. */
  function handleGoalNameFocusOut(){
    if (changed){ // Check for unsaved changes
      let name: string = id; // Local copy of id state to be changed if needed

      if (name.length == 0){ // Goal name is empty
        name = `(Goal ${index + 1})`; // Change local copy for uniqueness check
        setGoal(index, name); // Set valid placeholder name
        // Don't save, proceed to uniqueness check
      }

      if (goalNameUnique(name, index)){ // Goal name is unique
        setChanged(true); // Signal to parent component to save unsaved changes
        changed = false; // Mark changes as saved
      }
      else // Goal name not unique
        /* Set valid placeholder name; index makes it unique, exceeds length
           limit by 1 so that this name cannot be replicated by the user. */
        setGoal(index, `Name must be unique! ${index + 1}        `);
    } // Skip handling focus out if no changes
  }

  // Builds Cell elements for each material in goal to complete GoalRow
  Object.entries(mats).forEach(([key, value]) => {
    cells.push(
      <Cell key={key} controlledValue={value}
        onBlur={(roster || total) ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
        onChange={(roster || total) ? undefined : (e) => handleGoalMatChange(e, index, key)}
      /> // If not total row, specify change handlers for writeable field
    );
  });

  return(
    <Row className={total ? "bold table-row" : "table-row"}>
      <Cell key="id" colSpan={2} controlledValue={id}
        onBlur={total ? undefined : handleGoalNameFocusOut}
        onChange={total ? undefined : (e) => handleGoalNameChange(e, index)}
      />
      <Cell bold key="goldValue" value={goldValue(mats)}/>
      {cells}
    </Row>
  );
}