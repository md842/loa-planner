import './CharacterCard.css';

import {type ChangeEvent, type JSX, useState} from 'react';

import gold from '../assets/gold.png';
import silver from '../assets/silver.png';
import t4_blue from '../assets/t4_blue.png';
import t4_blueSolar from '../assets/t4_bluesolar.png';
import t4_fusion from '../assets/t4_fusion.png';
//import t4_gem from '../assets/t4_gem.png';
import t4_leap from '../assets/t4_leap.png';
import t4_red from '../assets/t4_red.png';
import t4_redSolar from '../assets/t4_redsolar.png';
import t4_shard from '../assets/t4_shard.png';

import Table from 'react-bootstrap/Table';

/** Interface for character goal data. */
export interface Goal{
  name: string;
  values: GoalValues;
}

/** Props interface for CharacterCard(). */
interface Character{
  name: string; // Name of character.
  ilvl: string; // Item level of character.
  class: string; // Class of character.
  goals: Goal[]; // Array of goals belonging to character.
}

/** Helps with type checking by providing a uniform index signature. **/
interface GoalValues{
  [key: string]: number; // Index signature
  silver: number;
  gold: number;
  shards: number;
  fusions: number;
  reds: number;
  blues: number;
  leaps: number;
  redSolars: number;
  blueSolars: number;
}

export function CharacterCard(params: Character): JSX.Element{
  var total: GoalValues; // Initialized by initTable, but not part of state
  const [table, setTable] = useState(initTable);

  function initTable(): JSX.Element[]{
    let workingTable: JSX.Element[] = [];
    total = {silver: 0, gold: 0, shards: 0, fusions: 0, reds: 0, blues: 0, leaps: 0, redSolars: 0, blueSolars: 0};
    
    params.goals.forEach((goal: Goal, index: number) => {
      // Build a row for each goal and push it to the table
      workingTable.push(<tr key={index}>{goalRow(goal)}</tr>);
      // Accumulate each goal's individual values into the total
      for (let [key, value] of Object.entries(goal.values))
        total[key] += value;
    });
    // Build a row for the total and push it to the table
    workingTable.push(<tr className="bold" key="total">{totalRow(total)}</tr>);
    return workingTable;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>, key: string, goal: Goal) => {
    if (e.target.value == "") // Input sanitization: allow deleting last digit
      e.target.value = "0"; // Set empty input to 0

    let input: number = Number(e.target.value);
    if (Number.isNaN(input)) // Input sanitization: Reject non-numeric input
      e.target.value = String(goal.values[key]); // Overwrite invalid value
    else{ // Input is valid
      e.target.value = String(input); // Input sanitization: Clear leading 0s
      let diff = input - goal.values[key];
      goal.values[key] = input; // Update value in goal
      total[key] += diff; // Update total

      // Update the total row in the table (setTable triggers re-render)
      setTable(table.slice(0, -1).concat(<tr className="bold" key="total">{totalRow(total)}</tr>));
    }
  }

  function goalRow(goal: Goal): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal
    // Add goal name and calculated gold value to the table row for this goal
    row.push(<td key="goalName"><input className="invis-input goal-name" defaultValue={goal.name}/></td>);
    row.push(<td key="goldValue"><input className="invis-input bold" value="Placeholder" disabled/></td>); // TODO: Calculate value using market data once implemented.

    // Build the rest of the table row for this goal by pushing values as <td>
    for (let [key, value] of Object.entries(goal.values))
      row.push(<td key={key}><input className="invis-input" defaultValue={value} onChange={(e) => handleChange(e, key, goal)}/></td>);

    return row;
  }

  function totalRow(total: GoalValues): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for the total
    // Add goal name and calculated gold value to the table row for the total
    row.push(<td key="goalName"><input className="invis-input goal-name" value="Total" disabled/></td>);
    row.push(<td key="goldValue"><input className="invis-input bold" value="Placeholder" disabled/></td>); // TODO: Calculate value using market data once implemented.

    // Build the rest of the table row for this goal by pushing values as <td>
    for (let [key, value] of Object.entries(total))
      row.push(<td key={key}><input className="invis-input" value={value} readOnly/></td>);

    return row;
  }

  return(
    <>
      <p>{params.name} - {params.ilvl} {params.class}</p>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Goal Name</th>
            <th>Gold Value</th>
            <th><img src={silver}/></th>
            <th><img src={gold}/></th>
            <th><img src={t4_shard}/></th>
            <th><img src={t4_fusion}/></th>
            <th><img src={t4_red}/></th>
            <th><img src={t4_blue}/></th>
            <th><img src={t4_leap}/></th>
            <th><img src={t4_redSolar}/></th>
            <th><img src={t4_blueSolar}/></th>
          </tr>
        </thead>
        <tbody>{table /* Render table as built in function body */}</tbody>
      </Table>
    </>
  );
}