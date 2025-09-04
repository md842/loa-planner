import {type ChangeEvent, type JSX, type RefObject, useRef, useState} from 'react';

import {type Goal, initGoal, initMaterials} from '../core/types';
import {saveChars} from '../core/character-data';
import {goldValue} from '../core/market-data';

import Button from 'react-bootstrap/Button';

/** Props interface for RemTable. */
interface GoalTableProps{
  goals: Goal[]; // The goals for this RemTable.
  goalsTotalRef: RefObject<Goal>;
  setRem: React.Dispatch<React.SetStateAction<JSX.Element>>;
  initRem: () => JSX.Element;
}

/** Constructs a Table element given a Character object specified by params. */
export function GoalTable(props: GoalTableProps): JSX.Element{
  let {goals, goalsTotalRef, setRem, initRem} = props; // Unpack props

  console.log("GoalTable rendering.");

  // Ref used by saveChanges(). true: unsaved changes to commit
  const changed: RefObject<boolean> = useRef(false);

  // Table state variables
  const [goalTable, setGoals] = useState(initGoalTable);

  function initGoalTable(): JSX.Element[]{
    let workingTable: JSX.Element[] = []; // Initialize table and goalsTotal
    goalsTotalRef.current = {name: "Total", mats: initMaterials()};
    
    goals.forEach((goal: Goal, index: number) => {
      // Build a row for each goal and push it to the table
      workingTable.push(<tr key={index}>{goalRow({goal: goal, isTotal: false})}</tr>);
      // Accumulate each goal's individual values into goalsTotal
      for (let [key, value] of Object.entries(goal.mats))
        goalsTotalRef.current.mats[key] += value;
    });
    if (goals.length > 1) // Build total row
      workingTable.push(<tr className="bold" key="totalGoals">{goalRow({goal: goalsTotalRef.current, isTotal: true})}</tr>);
    
    return workingTable; // Return table to state initializer
  }

  function addGoal(){
    if (goals.length == 10) // Limit goals to 10
      return;
    goals.push(initGoal()); // Adds a blank goal
    setGoals(initGoalTable); // Update the goal table
    setRem(initRem); // Update remaining materials tables
  } // Don't save character data; changing anything in the new goal will save.

  function removeGoal(){
    if (goals.length == 1) // Must have at least 1 goal
      return;
    goals.pop(); // Removes last goal
    setGoals(initGoalTable); // Update the goal table
    setRem(initRem); // Update remaining materials tables
    saveChars(); // Save updated character data directly (bypass saveChanges())
  }

  function handleGoalChange(e: ChangeEvent<HTMLInputElement>, key: string, goal: Goal){
    /* Sizes of these sections are dynamic, so row slicing is unreliable due to
       the asynchronous nature of state. Thus, re-initialization is used. */
    if (key == "name"){ // No input sanitization needed for name string
      goal.name = e.target.value; // Update char data
      setRem(initRem); // Update remaining materials tables
      changed.current = true; // Character data will be saved on next focus out
    }
    else if (sanitizeInput(e, goal.mats[key])){ // Checks valid numeric input
      goal.mats[key] = Number(e.target.value); // Update char data
      setGoals(initGoalTable); // Update goal table
      setRem(initRem); // Update remaining materials tables
      changed.current = true; // Character data will be saved on next focus out
    } // Reject non-numeric input outside of name field (do nothing)
  }

  function saveChanges(){
    if (changed.current){ // Check for unsaved changes
      saveChars(); // Save updated character data
      changed.current = false; // Mark changes as committed
    }
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
                   onBlur={saveChanges}
                   onChange={(e) => handleGoalChange(e, "name", fnParams.goal)}
                 />
               </td>
      );
    
    // Add calculated gold value to the table row for this goal
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value={goldValue(fnParams.goal.mats)} disabled/></td>); // TODO: Calculate value using market data once implemented.

    // Build the rest of the table row for this goal by pushing values as <td>
    Object.entries(fnParams.goal.mats).forEach(([key, value]) => {
      if (fnParams.isTotal) // Read-only if total row
        row.push(<td className="read-only" key={key}><input className="invis-input" value={Number.isNaN(value) ? "--" : value} disabled/></td>);
      else // If goal row, specify change handler
        row.push(<td className="writeable" key={key}>
                   <input
                     className="invis-input"
                     defaultValue={value}
                     onBlur={saveChanges}
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

function sanitizeInput(e: ChangeEvent<HTMLInputElement>, prevValue: number): boolean{
  if (e.target.value == "") // Input sanitization: allow deleting last digit
    e.target.value = "0"; // Set empty input to 0
  
  let input: number = Number(e.target.value);
  if (Number.isNaN(input)){ // Input sanitization: Reject non-numeric input
    e.target.value = String(prevValue); // Overwrite invalid value
    return false; // Input is invalid
  }
  e.target.value = String(input); // Input sanitization: Clear leading 0s
  return true; // Input is valid
}