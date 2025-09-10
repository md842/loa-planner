import {type ChangeEvent, type JSX, type RefObject} from 'react';

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

    // Add goal name to the table row for this goal
    if (fnParams.isTotal) // Read-only if total row
      row.push(<td className="read-only" key="name"><input className="invis-input goal-name" value={fnParams.goal.name} disabled/></td>);
    else // Writeable if non-total "Goals" row
      row.push(<td className="writeable" key="name">
                 <input
                   className="invis-input goal-name"
                   defaultValue={fnParams.goal.name}
                   onBlur={() => {saveChanges(changed); changed = false}}
                   onChange={(e) => handleGoalChange(e, "name", fnParams.goal)}
                 />
               </td>
      );
    
    // Add calculated gold value to the table row for this goal
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value={goldValue(fnParams.goal.mats)} disabled/></td>);

    // Build the rest of the table row for this goal by pushing values as <td>
    Object.entries(fnParams.goal.mats).forEach(([key, value]) => {
      if (fnParams.isTotal) // Read-only if total row
        row.push(<td className="read-only" key={key}><input className="invis-input" value={value} disabled/></td>);
      else // If goal row, specify change handler
        row.push(<td className="writeable" key={key}>
                   <input
                     className="invis-input"
                     defaultValue={value}
                     onBlur={() => {saveChanges(changed); changed = false}}
                     onChange={(e) => handleGoalChange(e, key, fnParams.goal)}
                   />
                 </td>
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