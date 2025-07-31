import './CharacterCard.css';

import {type JSX} from 'react';

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

/** Props interface for CharacterCard(). */
interface Character{
  name: string; // Name of character.
  ilvl: string; // Item level of character.
  class: string; // Class of character.
  goals: Goal[]; // Array of goals belonging to character.
}

/** Interface for character goal data. */
export interface Goal{
  name: string;
  values: GoalValues;
}

/** Helps with type checking by providing a uniform index signature. **/
interface GoalValues{
  [key: string]: number;
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
  let table: JSX.Element[] = []; // Initialize character table and total values
  let total: Goal = {name: "Total", values: {silver: 0, gold: 0, shards: 0, fusions: 0, reds: 0, blues: 0, leaps: 0, redSolars: 0, blueSolars: 0}};

  params.goals.forEach((goal: Goal, index: number) => { // For each goal the character has:
    let row: JSX.Element[] = []; // Initialize table row for this goal
    // Add goal name and calculated gold value to the table row for this goal
    row.push(<td key="goalName"><input className="invis-input goal-name" defaultValue={goal.name}/></td>);
    row.push(<td key="goldValue"><b><input className="invis-input" value="Placeholder" disabled/></b></td>); // TODO: Calculate value using market data once implemented.

    // Build the rest of the table row for this goal by pushing values as <td>
    for (let [key, value] of Object.entries(goal.values)){
      total.values[key] += value; // Accumulate value into total and add to row
      row.push(<td key={key}><input className="invis-input" defaultValue={value} key={key}/></td>);
    }

    table.push(<tr key={index}>{row}</tr>); // Push completed row to table
  });

  let totalRow: JSX.Element[] = []; // Initialize table row for the total
  // Add "Total" label and calculated gold value to the table row for the total
  totalRow.push(<td key="goalName"><b><input className="invis-input goal-name" defaultValue={total.name}/></b></td>);
  totalRow.push(<td key="goldValue"><b><input className="invis-input" value="Placeholder" disabled/></b></td>); // TODO: Calculate value using market data once implemented.

  // Build the rest of the table row for the total by pushing values as <td>
  for (let [key, value] of Object.entries(total.values))
    totalRow.push(<td key={key}><b><input className="invis-input" defaultValue={value}/></b></td>);

  table.push(<tr key="total">{totalRow}</tr>); // Push completed row to table

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