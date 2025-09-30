import {type ChangeEvent, type ReactNode, useEffect, useState} from 'react';

import {Cell} from './Cell';

import {type Goal, type Materials} from '../../core/types';
import {sanitizeInput} from './common';
import {goldValue} from '../../core/market-data';

// If true, changes will be committed by saveSources() on next onBlur event.
let changed: boolean = false;

/** Props interface for GoalRow. */
interface GoalRowProps{
  total?: boolean; // If true, this row represents the table total.
  goal: Goal; // The Goal that this GoalRow is displaying.
  index: number; // The index of the Goal that this GoalRow is displaying.

  /** References to parent component state/state setters */
  // Signals to parent component to save uncommitted changes.
  setChanged(changed: boolean): void;
  // Updates goals.
  setGoal(goalIndex: number, id?: string, key?: keyof Materials, value?: number): void;
}

// Generate a table row for the "Goals" section.
export function GoalRow(props: GoalRowProps): ReactNode{
  let {total, goal, index, setChanged, setGoal} = props;  // Unpack props
  let cells: ReactNode[] = []; // Initialize table row for this goal

  // State variables for controlled input fields, initialize with goal data
  const [id, setId] = useState(goal.id);
  const [mats, setMats] = useState(goal.mats);

  useEffect(() => {
    setId(goal.id);
    setMats(goal.mats);
  }, [goal]); // Runs when goal changes, does nothing on mount due to initial state false

  function handleGoalChange(e: ChangeEvent<HTMLInputElement>, key: string, index: number){
    if (key == "id"){ // No input sanitization needed for name string
      if (e.target.value.length < 30){ // Under length limit, accept input
        setGoal(index, e.target.value); // Update goal data
        changed = true; // Goal data will be saved on next focus out
      }
      else // Over length limit, reject input
        e.target.value = goal.id; // Resets field to last good value
    }
    else if (sanitizeInput(e, goal.mats[key])){ // Valid numeric input
      setGoal(index, undefined, key as keyof Materials, Number(e.target.value)); // Update goal data
      changed = true; // Character data will be saved on next focus out
    } // Reject non-numeric input outside of name field (do nothing)
  }

  Object.entries(mats).forEach(([key, value]) => {
    cells.push( // Build rest of row for this goal by pushing values as Cells
      <Cell key={key} controlledValue={value}
        onBlur={total ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
        onChange={total ? undefined : (e) => handleGoalChange(e, key, index)}
      /> // If not total row, specify change handlers for writeable field
    );
  });

  return(
    <tr className={total ? "bold" : undefined}>
      <Cell key="id" controlledValue={id} className="first-col"
        onBlur={total ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
        onChange={total ? undefined : (e) => handleGoalChange(e, "id", index)}
      />
      <Cell bold key="goldValue" value={goldValue(mats)}/>
      {cells}
    </tr>
  );
}