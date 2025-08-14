import './CharacterCard.css';

import {type Character, type Goal, type Materials} from '../components/Core';
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

export function CharacterCard(char: Character): JSX.Element{
  var goalsTotal: Goal; // Initialized by initGoalTable, but not part of state
  const [goalTable, setGoals] = useState(initGoalTable);
  const [matsTable,] = useState(initMatsTable);
  const [remTable,] = useState(initRemTable);
  const [remBoundTable,] = useState(initRemBoundTable);


  function initGoalTable(): JSX.Element[]{
    let workingTable: JSX.Element[] = [];
    goalsTotal = {name: "Total", values: {silver: 0, gold: 0, shards: 0, fusions: 0, reds: 0, blues: 0, leaps: 0, redSolars: 0, blueSolars: 0}};

    // Add section title
    workingTable.push(<tr className="bold" key="goals"><td className="section-title" colSpan={11}>Goals</td></tr>);
    
    char.goals.forEach((goal: Goal, index: number) => {
      // Build a row for each goal and push it to the table
      workingTable.push(<tr key={index}>{goalRow({goal: goal, isTotal: false})}</tr>);
      // Accumulate each goal's individual values into the total
      for (let [key, value] of Object.entries(goal.values))
        goalsTotal.values[key] += value;
    });
    // Build a row for the goals total and push it to the table
    workingTable.push(<tr className="bold" key="totalGoals">{goalRow({goal: goalsTotal, isTotal: true})}</tr>);
    
    return workingTable;
  }


  function initMatsTable(): JSX.Element[]{
    let workingTable: JSX.Element[] = [];
    
    // Add section title
    workingTable.push(<tr className="bold" key="ownedMats"><td className="section-title" colSpan={11}>Owned materials</td></tr>);

    // Owned materials section
    workingTable.push(<tr key="boundMats">{matRow({name: "Bound", disable: 1})}</tr>);
    workingTable.push(<tr key="rosterMats">{matRow({name: "Roster", disable: 11})}</tr>);
    workingTable.push(<tr className="bold" key="totalMats">{matRow({name: "Total", disable: 11})}</tr>);
    
    return workingTable;
  }


  // Can't pass arguments to initializer functions, so this is the workaround.
  function initRemTable(): JSX.Element[]{
    return initRemTableBase({name: "Remaining materials", subtract: {silver: 0, gold: 0, shards: 0, fusions: 0, reds: 0, blues: 0, leaps: 0, redSolars: 0, blueSolars: 0}});
  }


  function initRemBoundTable(): JSX.Element[]{
    return initRemTableBase({name: "Remaining materials (Bound only)", subtract: char.boundMats});
  }


  function initRemTableBase(fnParams: {name: string, subtract: Materials}): JSX.Element[]{
    let workingTable: JSX.Element[] = [];
    
    // Add section title
    workingTable.push(<tr className="bold section-title" key="ownedMats"><td className="section-title" colSpan={11}>{fnParams.name}</td></tr>);

    char.goals.forEach((goal: Goal, index: number) => {
      // Build a row for each goal and push it to the table
      workingTable.push(<tr key={index}>{goalRow({goal: goal, isTotal: false, subtract: fnParams.subtract})}</tr>);
    });
    // Build a row for the goals total and push it to the table
    workingTable.push(<tr className="bold" key="totalGoals">{goalRow({goal: goalsTotal, isTotal: true, subtract: fnParams.subtract})}</tr>);
    
    return workingTable;
  }


  const handleGoalChange = (e: ChangeEvent<HTMLInputElement>, key: string, goal: Goal) => {
    if (e.target.value == "") // Input sanitization: allow deleting last digit
      e.target.value = "0"; // Set empty input to 0

    let input: number = Number(e.target.value);
    if (Number.isNaN(input)) // Input sanitization: Reject non-numeric input
      e.target.value = String(goal.values[key]); // Overwrite invalid value
    else{ // Input is valid
      e.target.value = String(input); // Input sanitization: Clear leading 0s
      let diff = input - goal.values[key];
      goal.values[key] = input; // Update value in goal
      goalsTotal.values[key] += diff; // Update total

      // Update the total row in the table (setTable triggers re-render)
      let goalRows = goalTable.slice(0, char.goals.length + 1);
      let goalTotalRow = <tr className="bold" key="total">{goalRow({goal: goalsTotal, isTotal: true})}</tr>;
      let remainder = goalTable.slice(char.goals.length + 2);

      setGoals([...goalRows, goalTotalRow, ...remainder]);
    }
  }


  function goalRow(fnParams: {goal: Goal, isTotal: boolean, subtract?: Materials}): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal

    // Add goal name to the table row for this goal
    if (fnParams.isTotal || fnParams.subtract) // Read-only if "Remaining materials" row or total row
      row.push(<td className="read-only" key="name"><input className="invis-input goal-name" value={fnParams.goal.name} disabled/></td>);
    else // Writeable if non-total goal row
      row.push(<td className="writeable" key="name"><input className="invis-input goal-name" defaultValue={fnParams.goal.name}/></td>);
    
    // Add calculated gold value to the table row for this goal
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value="Placeholder" disabled/></td>); // TODO: Calculate value using market data once implemented.

    // Build the rest of the table row for this goal by pushing values as <td>
    for (let [key, value] of Object.entries(fnParams.goal.values)){
      if (fnParams.subtract){ // Row is in the "Remaining materials" section
        value = Math.max(0, value - fnParams.subtract[key]) // Must be >= 0
        // Always read only. Ternary expression replaces NaN with "--"
        row.push(<td className="read-only" key={key}><input className="invis-input" value={Number.isNaN(value) ? "--" : value} disabled/></td>);
      }
      else{ // Row is in the "Goals" section.
        if (fnParams.isTotal) // If total row, disable the input
          row.push(<td className="read-only" key={key}><input className="invis-input" value={value} disabled/></td>);
        else // If goal row, specify change handler
          row.push(<td className="writeable" key={key}><input className="invis-input" defaultValue={value} onChange={(e) => handleGoalChange(e, key, fnParams.goal)}/></td>);
      }
    }
    return row;
  }


  function matRow(fnParams: {name: string, disable: number}): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal
    // Add goal name and calculated gold value to the table row for this goal
    row.push(<td className="read-only" key="name"><input className="invis-input bold" value={fnParams.name} disabled/></td>);
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value="Placeholder" disabled/></td>); // TODO: Calculate value using market data once implemented.

    // Build the rest of the table row for this goal by pushing values as <td>
    for (let i = 0; i < 9; i++){
      if (i < fnParams.disable) // If disabled field, disable the input
        row.push(<td className="read-only" key={i}><input className="invis-input" value={0} disabled/></td>);
      else // If enabled field, specify change handler
        row.push(<td className="writeable" key={i}><input className="invis-input" defaultValue={0}/></td>);
    }

    return row;
  }


  return(
    <Table hover>
      <thead>
        <tr>
          <th>{char.name}<br/>{char.ilvl} {char.class}</th>
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
      <tbody>
        {goalTable}
        {matsTable}
        <tr><th colSpan={11}>&nbsp;</th></tr>{/* Blank row as spacer */}
        {remTable}
        {remBoundTable}
      </tbody>
    </Table>
  );
}