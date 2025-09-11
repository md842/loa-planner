import {type ChangeEvent, type JSX, type RefObject} from 'react';

import {Cell} from './Cell';

import {sanitizeInput, saveChanges} from './common';
import {type Goal, initGoal, initMaterials} from '../core/types';
import {expandRosterGoals} from '../core/character-data';
import {goldValue} from '../core/market-data';

import Button from 'react-bootstrap/Button';

/** Props interface for GoalTable. */
interface GoalTableProps{
  goals: Goal[]; // The character goals for this GoalTable
  goalsTotalRef: RefObject<Goal>; // Passed to RemTable to avoid re-calculation
  index: number;
  // References to parent component state/state setters
  setGoals: () => void;
  setRem: () => void;
  updateRosterGoals: () => void;
  updateRosterRem: () => void;
}

// If true, changes will be committed by saveChanges() on next onBlur event.
let changed: boolean = false;

/** Constructs the "Goals" section of the parent table. */
export function CharacterGoalTable(props: GoalTableProps): JSX.Element{
  let {goals, goalsTotalRef, index, setGoals, setRem, updateRosterGoals, updateRosterRem} = props; // Unpack props

  console.log("CharacterGoalTable rendering");

  let goalTable: JSX.Element[] = []; // Initialize table and goalsTotal
  goalsTotalRef.current = {name: "Total", mats: initMaterials()};
  
  goals.forEach((goal: Goal, index: number) => {
    // Build a row for each goal and push it to the table
    goalTable.push(<tr key={index}>{goalRow({goal: goal, isTotal: false})}</tr>);
    // Accumulate each goal's individual values into goalsTotal
    for (let [key, value] of Object.entries(goal.mats))
      goalsTotalRef.current.mats[key] += value;
  });
  if (goals.length > 1) // Build total row for char with >1 goals
    goalTable.push(<tr className="bold" key="totalGoals">{goalRow({goal: goalsTotalRef.current, isTotal: true})}</tr>);


  function addGoal(){
    if (goals.length == 10) // Limit goals to 10
      return;
    goals.push(initGoal()); // Adds a blank goal
    expandRosterGoals(index, true);
    setGoals(); // Update goals table
    setRem(); // Update remaining materials table(s)
  } // Don't save character data; changing anything in the new goal will save.

  function removeGoal(){
    if (goals.length == 1) // Must have at least 1 goal
      return;
    goals.pop(); // Removes last goal
    expandRosterGoals(index, false);
    setGoals(); // Update goals table
    setRem(); // Update remaining materials table(s)
    saveChanges(true); // Save updated character data
  }

  function handleGoalChange(e: ChangeEvent<HTMLInputElement>, key: string, goal: Goal){
    if (key == "name"){ // No input sanitization needed for name string
      if (e.target.value.length < 30){ // Under length limit, accept input
        goal.name = e.target.value; // Update char data
        setRem(); // Update remaining materials table(s)
        changed = true; // Character data will be saved on next focus out
      }
      else // Over length limit, reject input
        e.target.value = goal.name; // Resets field to last good value
    }
    else if (sanitizeInput(e, goal.mats[key])){ // Valid numeric input
      goal.mats[key] = Number(e.target.value); // Update char data
      setGoals(); // Update goals table
      setRem(); // Update remaining materials table(s)
      updateRosterGoals(); // Send signal to update RosterCard goalsTable
      updateRosterRem(); // Send signal to update RosterCard remTable
      changed = true; // Character data will be saved on next focus out
    } // Reject non-numeric input outside of name field (do nothing)
  }

  /**
   * Generate a table row for the "Goals" section.
   * @param  {Goal}           goal      The goal being used to generate the row.
   * @param  {boolean}        isTotal   If true, this row represents a section total.
   * @return {JSX.Element[]}            The generated table row.
   */
  function goalRow(fnParams: {goal: Goal, isTotal: boolean}): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal

    row.push( // Add goal name field to the table row for this goal
      <Cell key="name" value={fnParams.goal.name} className="goal-name"
        onBlur={(fnParams.isTotal) ? undefined : () => {saveChanges(changed); changed = false}}
        onChange={(fnParams.isTotal) ? undefined : (e) => handleGoalChange(e, "name", fnParams.goal)}
      /> // If not total row, specify change handlers for writeable field
    );
    
    // Add calculated gold value to the table row for this goal
    row.push(<Cell key="goldValue" className="bold" value={goldValue(fnParams.goal.mats)}/>);

    Object.entries(fnParams.goal.mats).forEach(([key, value]) => {
      row.push( // Build rest of row for this goal by pushing values as Cells
        <Cell key={key} value={value}
          onBlur={(fnParams.isTotal) ? undefined : () => {saveChanges(changed); changed = false}}
          onChange={(fnParams.isTotal) ? undefined : (e) => handleGoalChange(e, key, fnParams.goal)}
        /> // If not total row, specify change handlers for writeable field
      );
    });
    return row;
  }

  return(
    <>
      <tr className="bold">
        <td className="section-title goals" colSpan={1}>Goals</td>
        <td className="section-title goal-btns" colSpan={10}>
          <Button variant="primary" onClick={addGoal}>Add Goal</Button>
          <Button variant="primary" onClick={removeGoal}>Remove Goal</Button>
        </td>
      </tr>
      {goalTable}
    </>
  );
}