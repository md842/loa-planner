import {type ChangeEvent, type JSX} from 'react';

import {Cell} from './Cell';

import {type Goal} from '../core/types';
import {addRosterGoal, delRosterGoal, saveRosterGoals, setRosterGoalName} from '../core/character-data';
import {goldValue} from '../core/market-data';

import Button from 'react-bootstrap/Button';

/** Props interface for RosterGoalTable. */
interface RosterGoalTableProps{
  goals: Goal[]; // The roster goals for this GoalTable
  // References to parent component state/state setters
  setGoals: () => void;
  setRem: () => void;
}

// If true, changes will be committed by saveChanges() on next onBlur event.
let changed: boolean = false;

/** Constructs the "Roster Goals" section of the parent table. */
export function RosterGoalTable(props: RosterGoalTableProps): JSX.Element{
  let {goals, setGoals, setRem} = props; // Unpack props

  console.log("RosterGoalTable rendering");

  let goalTable: JSX.Element[] = []; // Initialize table
  
  goals.forEach((goal: Goal, index: number) => {
    // Build a row for each goal and push it to the table
    goalTable.push(<tr key={index}>{goalRow({goal: goal, index: index})}</tr>);
  });


  function addGoal(){
    if (goals.length == 10) // Limit roster goals to 10
      return;
    addRosterGoal(); // Add blank roster goal
    setGoals(); // Update goals table
    setRem(); // Update remaining materials table(s)
  }

  function removeGoal(){
    if (goals.length == 1) // Must have at least 1 goal
      return;
    delRosterGoal(goals.length - 1); // Removes last roster goal
    setGoals(); // Update goals table
    setRem(); // Update remaining materials table(s)
  }

  function handleGoalChange(e: ChangeEvent<HTMLInputElement>, index: number){
    if (e.target.value.length < 30){ // Under length limit, accept input
      setRosterGoalName(index, e.target.value); // Update roster goal name
      setRem(); // Update remaining materials table(s)
      changed = true; // Roster goal data will be saved on next focus out
    }
    else // Over length limit, reject input
      e.target.value = goals[index].name; // Resets field to last good value
  }

  /**
   * Generate a table row for the "Goals" section.
   * @param  {Goal}           goal      The goal being used to generate the row.
   * @param  {number}         index     The index of the goal being used to generate the row.
   * @return {JSX.Element[]}            The generated table row.
   */
  function goalRow(fnParams: {goal: Goal, index: number}): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal

    row.push( // Add writeable name to the table row for this roster goal
      <Cell key="name" value={fnParams.goal.name} className="goal-name"
        onBlur={() => {if (changed){saveRosterGoals()}; changed = false}}
        onChange={(e) => handleGoalChange(e, fnParams.index)}
      /> // Always writeable, specify change handlers for writeable field
    );
    
    // Add calculated gold value to the table row for this goal
    row.push(<Cell key="goldValue" className="bold" value={goldValue(fnParams.goal.mats)}/>);

    // Build rest of row for this goal by pushing values as Cells
    Object.entries(fnParams.goal.mats).forEach(([key, value]) => {
      row.push(<Cell key={key} value={value}/>);
    }); // Always read-only, do not specify change handlers
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