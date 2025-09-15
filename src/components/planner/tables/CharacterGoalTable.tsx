import {type ChangeEvent, type JSX, type RefObject, useState} from 'react';

import {Cell} from './Cell';

import {sanitizeInput, saveChanges} from './common';
import {addMaterials, type Goal, initGoal, initMaterials, subMaterials} from '../../core/types';
import {expandRosterGoals} from '../../core/character-data';
import {goldValue} from '../../core/market-data';

import Button from 'react-bootstrap/Button';

/** Props interface for GoalTable. */
interface GoalTableProps{
  goals: Goal[]; // The character goals for this GoalTable
  goalsTotalRef: RefObject<Goal>; // Passed to RemTable to avoid re-calculation
  charIndex: number; // The index of the character this GoalTable is for.
  // References to parent component state/state setters
  updateCharRem: () => void;
  updateRosterGoals: () => void;
  updateRosterRem: () => void;
}

// If true, changes will be committed by saveChanges() on next onBlur event.
let changed: boolean = false;

/** Constructs the "Goals" section of the parent table. */
export function CharacterGoalTable(props: GoalTableProps): JSX.Element{
  let {goals, goalsTotalRef, charIndex, updateCharRem, updateRosterGoals, updateRosterRem} = props; // Unpack props

  // Table state variable for character goals.
  const [table, updateTable] = useState(initTable);

  function initTable(): JSX.Element[]{ // Table state initializer function
    let table: JSX.Element[] = []; // Initialize table and goalsTotal
    goalsTotalRef.current = {name: "Total", mats: initMaterials()};
    
    goals.forEach((goal: Goal, index: number) => {
      // Build a row for each goal and push it to the table
      table.push(<GoalRow key={index} goal={goal} index={index}/>);
      // Accumulate each goal's individual values into goalsTotal.mats
      goalsTotalRef.current.mats = addMaterials(goalsTotalRef.current.mats, goal.mats);
    });
    if (goals.length > 1) // Build total row for char with >1 goals
      table.push(<GoalRow total key="total" goal={goalsTotalRef.current} index={-1}/>);
    return table;
  }

  function addGoal(){
    if (goals.length == 10) // Limit goals to 10
      return;
    goals.push(initGoal()); // Adds a blank goal
    // Expand all roster goal entries for the current charIndex (default false)
    expandRosterGoals(charIndex, true);

    updateTable([
      ...table.slice(0, -1),
      <GoalRow key={goals.length - 1} goal={goals[goals.length - 1]} index={goals.length - 1}/>,
      <GoalRow total key="total" goal={goalsTotalRef.current} index={-1}/>,
    ]); // Only re-renders the row being updated and the total row

    updateCharRem(); // Update remaining materials table(s)
  } // Don't save goal data; changing anything in the new goal will save.

  function removeGoal(){
    if (goals.length == 1) // Must have at least 1 goal
      return;
    // Removes last goal and subtracts its mats from goalsTotal
    goalsTotalRef.current.mats = subMaterials(goalsTotalRef.current.mats, goals.pop()!.mats);
    // Contract all roster goal entries for the current charIndex
    expandRosterGoals(charIndex, false);

    updateTable([
      ...table.slice(0, -2),
      <GoalRow total key="total" goal={goalsTotalRef.current} index={-1}/>,
    ]); // Only re-renders the row being updated and the total row

    updateCharRem(); // Update remaining materials table(s)
    updateRosterGoals(); // Send signal to update RosterCard goalsTable
    updateRosterRem(); // Send signal to update RosterCard remTable
    saveChanges(true); // Save updated goal data
  }

  function handleGoalChange(e: ChangeEvent<HTMLInputElement>, key: string, goal: Goal, index: number){
    if (key == "name"){ // No input sanitization needed for name string
      if (e.target.value.length < 30){ // Under length limit, accept input
        goal.name = e.target.value; // Update goal data
        updateCharRem(); // Update remaining materials table(s)
        changed = true; // Goal data will be saved on next focus out
      }
      else // Over length limit, reject input
        e.target.value = goal.name; // Resets field to last good value
    }
    else if (sanitizeInput(e, goal.mats[key])){ // Valid numeric input
      // Update goalsTotal with difference between new and old values
      goalsTotalRef.current.mats[key] += Number(e.target.value) - goal.mats[key];
      goal.mats[key] = Number(e.target.value); // Update goal data

      updateTable([
        ...table.slice(0, index),
        <GoalRow key={index} goal={goal} index={index}/>,
        ...table.slice(index + 1, -1),
        <GoalRow total key="total" goal={goalsTotalRef.current} index={-1}/>,
      ]); // Only re-renders the row being updated and the total row

      updateCharRem(); // Update remaining materials table(s)
      updateRosterGoals(); // Send signal to update RosterCard goalsTable
      updateRosterRem(); // Send signal to update RosterCard remTable
      changed = true; // Character data will be saved on next focus out
    } // Reject non-numeric input outside of name field (do nothing)
  }

  /**
   * Generate a table row for the "Goals" section.
   * @param  {boolean}        total     If true, this row represents a section total.
   * @param  {Goal}           goal      The goal being used to generate the row.
   * @param  {number}         index     The index of the goal being used to generate the row.
   * @return {JSX.Element[]}            The generated table row.
   */
  function GoalRow(props: {total?: boolean, goal: Goal, index: number}): JSX.Element{
    let {total, goal, index} = props;  // Unpack props
    let cells: JSX.Element[] = []; // Initialize table row for this goal

    console.log("Character", charIndex, "GoalRow", total ? "Total" : index, "rendering");

    cells.push( // Add goal name field to the table row for this goal
      <Cell key="name" value={goal.name} className="first-col"
        onBlur={total ? undefined : () => {saveChanges(changed); changed = false}}
        onChange={total ? undefined : (e) => handleGoalChange(e, "name", goal, index)}
      /> // If not total row, specify change handlers for writeable field
    );
    
    // Add calculated gold value to the table row for this goal
    cells.push(<Cell bold key="goldValue" value={goldValue(goal.mats)}/>);

    Object.entries(goal.mats).forEach(([key, value]) => {
      cells.push( // Build rest of row for this goal by pushing values as Cells
        <Cell key={key} value={value}
          onBlur={total ? undefined : () => {saveChanges(changed); changed = false}}
          onChange={total ? undefined : (e) => handleGoalChange(e, key, goal, index)}
        /> // If not total row, specify change handlers for writeable field
      );
    });
    return <tr className={total ? "bold" : undefined}>{cells}</tr>;
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
      {table}
    </>
  );
}