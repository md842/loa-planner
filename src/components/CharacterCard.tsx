import './CharacterCard.css';

import {type Character, type Goal, type Materials, loadRosterMats} from '../components/Core';
import {type ChangeEvent, type JSX, useState} from 'react';

import gold from '../assets/gold.png';
import silver from '../assets/silver.png';
import t4_blue from '../assets/t4_blue.png';
import t4_blueSolar from '../assets/t4_bluesolar.png';
import t4_fusion from '../assets/t4_fusion.png';
import t4_leap from '../assets/t4_leap.png';
import t4_red from '../assets/t4_red.png';
import t4_redSolar from '../assets/t4_redsolar.png';
import t4_shard from '../assets/t4_shard.png';

import Table from 'react-bootstrap/Table';

export function CharacterCard(char: Character): JSX.Element{
  var rosterMats: Materials = loadRosterMats(); // From Core.ts, initialized here

  var goalsTotal: Goal; // Initialized by initGoalTable, but not part of state
  var matsTotal: Materials; // Initialized by initMatsTable, but not part of state

  const [goalTable, setGoals] = useState(initGoalTable);
  const [matsTable, setMats] = useState(initMatsTable);
  const [remTable, setRem] = useState(initRemTable);
  const [remBoundTable, setRemBound] = useState(initRemBoundTable);


  function initGoalTable(): JSX.Element[]{
    let workingTable: JSX.Element[] = []; // Initialize table and goalsTotal
    goalsTotal = {name: "Total", values: {silver: 0, gold: 0, shards: 0, fusions: 0, reds: 0, blues: 0, leaps: 0, redSolars: 0, blueSolars: 0}};

    // Add section title
    workingTable.push(<tr className="bold" key="goals"><td className="section-title" colSpan={11}>Goals</td></tr>);
    
    char.goals.forEach((goal: Goal, index: number) => {
      // Build a row for each goal and push it to the table
      workingTable.push(<tr key={index}>{goalRow({goal: goal, index: index})}</tr>);
      // Accumulate each goal's individual values into goalsTotal
      for (let [key, value] of Object.entries(goal.values))
        goalsTotal.values[key] += value;
    });
    // Build a row for the goals total and push it to the table
    workingTable.push(<tr className="bold" key="totalGoals">{goalRow({goal: goalsTotal, index: -1})}</tr>);
    
    return workingTable; // Return table to state initializer
  }


  function initMatsTable(): JSX.Element[]{
    let workingTable: JSX.Element[] = []; // Initialize table and matsTotal
    matsTotal = {silver: 0, gold: 0, shards: 0, fusions: 0, reds: 0, blues: 0, leaps: 0, redSolars: 0, blueSolars: 0};
    
    // Add section title
    workingTable.push(<tr className="bold" key="ownedMats"><td className="section-title" colSpan={11}>Owned materials</td></tr>);

    // Accumulate total materials
    for (let [key, value] of Object.entries(rosterMats))
      matsTotal[key] = char.boundMats[key] + value;
    matsTotal["silver"] = rosterMats["silver"];

    // Build and push each owned materials row
    workingTable.push(<tr key="boundMats">{matsRow({mats: char.boundMats, name: "Bound"})}</tr>);
    workingTable.push(<tr key="rosterMats">{matsRow({mats: rosterMats, name: "Roster"})}</tr>);
    workingTable.push(<tr className="bold" key="totalMats">{matsRow({mats: matsTotal, name: "Total"})}</tr>);
    
    return workingTable; // Return table to state initializer
  }


  // State initializers cannot take arguments, set up "subtract" with helpers.
  function initRemTable(): JSX.Element[]{ // "Remaining materials" section
    return initRemTableBase({name: "Remaining materials", subtract: matsTotal});
  }
  function initRemBoundTable(): JSX.Element[]{ // "Remaining bound materials" section
    return initRemTableBase({name: "Remaining bound materials", subtract: char.boundMats});
  }
  function initRemTableBase(fnParams: {name: string, subtract: Materials}): JSX.Element[]{
    let workingTable: JSX.Element[] = []; // Initialize table
    
    // Add section title
    workingTable.push(<tr className="bold section-title" key="ownedMats"><td className="section-title" colSpan={11}>{fnParams.name}</td></tr>);

    char.goals.forEach((goal: Goal, index: number) => {
      // Build a row for each goal and push it to the table
      workingTable.push(<tr key={index}>{goalRow({goal: goal, index: index, subtract: fnParams.subtract})}</tr>);
    });
    // Build a row for the goals total and push it to the table
    workingTable.push(<tr className="bold" key="totalGoals">{goalRow({goal: goalsTotal, index: -1, subtract: fnParams.subtract})}</tr>);
    
    return workingTable; // Return table to state initializer
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


  function handleGoalChange(e: ChangeEvent<HTMLInputElement>, key: string, goalIndex: number){
    let goal = char.goals[goalIndex]; // Get goal from index

    if (sanitizeInput(e, goal.values[key])){ // Update only if valid input
      let input: number = Number(e.target.value);

      // Update "Goals" section
      let diff = input - goal.values[key];
      goal.values[key] = input; // Update value in goal
      goalsTotal.values[key] += diff; // Update goals total

      // Update the goals total row in the table
      let remainder = goalTable.slice(0, -1);
      let goalTotalRow = <tr className="bold" key="total">{goalRow({goal: goalsTotal, index: -1})}</tr>;
      setGoals([...remainder, goalTotalRow]); // Update state (triggers re-render)

      // Update "Remaining materials" sections. Each only needs 2 row updates
      // (changed goal, total), so avoid re-initializing tables.
      [{table: remTable, setter: setRem, subtract: matsTotal}, // "Remaining materials"
       {table: remBoundTable, setter: setRemBound, subtract: char.boundMats} // "Remaining materials (Bound only)"
      ].forEach((params: {table: JSX.Element[], setter: React.Dispatch<React.SetStateAction<JSX.Element[]>>, subtract: Materials}) => {
        let pre = params.table.slice(0, goalIndex + 1); // Section title and any goals before the goal being changed
        let remRow = <tr key={goalIndex}>{goalRow({goal: goal, index: goalIndex, subtract: params.subtract})}</tr>; // The goal being changed
        let post = params.table.slice(goalIndex + 2, -1); // Any goals after the goal being changed
        let remTotalRow = <tr className="bold" key="total">{goalRow({goal: goalsTotal, index: -1, subtract: params.subtract})}</tr>; // The total
        params.setter([...pre, remRow, ...post, remTotalRow]); // Update state (triggers re-render)
      });

      // TODO: Save updated goals to character data
    }
  }


  function handleBoundMatChange(e: ChangeEvent<HTMLInputElement>, key: string){
    if (sanitizeInput(e, char.boundMats[key])){ // Update only if valid input
      let input: number = Number(e.target.value);

      // Update "Owned materials" section
      let diff = input - char.boundMats[key];
      char.boundMats[key] = input; // Update value in goal
      matsTotal[key] += diff; // Update goals total

      // Update the mats total row in the table
      let remainder = matsTable.slice(0, -1);
      let matsTotalRow = <tr className="bold" key="totalMats">{matsRow({mats: matsTotal, name: "Total"})}</tr>;
      setMats([...remainder, matsTotalRow]); // Update state (triggers re-render)

      // Update "Remaining materials" sections.
      setRem(initRemTable); // Must update all rows, so just re-initialize.
      setRemBound(initRemBoundTable); // Same goes here.

      // TODO: Save updated bound mats to character data
    }
  }

  /**
   * Generate a table row for the "Goals" or "Remaining materials" sections.
   * @param  {Goal}           goal      The goal being used to generate the row.
   * @param  {number}         index     The index of the goal, used for handleGoalChange.
   *                                    If index == -1, this row represents a section total.
   * @param  {Materials}      subtract  The materials to subtract from the goal.
   *                                    If defined, this row is in a "Remaining materials" section.
   * @return {JSX.Element[]}            The generated table row.
   */
  function goalRow(fnParams: {goal: Goal, index: number, subtract?: Materials}): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal

    // Add goal name to the table row for this goal
    if (fnParams.index == -1 || fnParams.subtract) // Read-only if total or "Remaining materials" row
      row.push(<td className="read-only" key="name"><input className="invis-input goal-name" value={fnParams.goal.name} disabled/></td>);
    else // Writeable if non-total "Goals" row
      row.push(<td className="writeable" key="name"><input className="invis-input goal-name" defaultValue={fnParams.goal.name}/></td>);
    
    // Add calculated gold value to the table row for this goal
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value="Placeholder" disabled/></td>); // TODO: Calculate value using market data once implemented.

    // Build the rest of the table row for this goal by pushing values as <td>
    Object.entries(fnParams.goal.values).forEach(([key, value]) => {
      if (fnParams.subtract){ // Row is in the "Remaining materials" section
        value = Math.max(0, value - fnParams.subtract[key]) // Must be >= 0
        // Always read only. Ternary expression replaces NaN with "--"
        row.push(<td className="read-only" key={key}><input className="invis-input" value={Number.isNaN(value) ? "--" : value} disabled/></td>);
      }
      else{ // Row is in the "Goals" section.
        if (fnParams.index == -1) // If total row, disable the input
          row.push(<td className="read-only" key={key}><input className="invis-input" value={value} disabled/></td>);
        else // If goal row, specify change handler
          row.push(<td className="writeable" key={key}><input className="invis-input" defaultValue={value} onChange={(e) => handleGoalChange(e, key, fnParams.index)}/></td>);
      }
    });
    return row;
  }

  /**
   * Generate a table row for the "Owned materials" section.
   * @param  {Materials}      mats  The materials populating the row.
   * @param  {string}         name  The name of the row (e.g., "Bound", "Roster", "Total").
   *                                "Bound" is writeable other than "silver", the rest are read-only.
   * @return {JSX.Element[]}        The generated table row.
   */
  function matsRow(fnParams: {mats: Materials, name: string}): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal

    // Add goal name and calculated gold value to the table row for this goal
    row.push(<td className="read-only" key="name"><input className="invis-input bold" value={fnParams.name} disabled/></td>);
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value="Placeholder" disabled/></td>); // TODO: Calculate value using market data once implemented.

    // Build the rest of the table row for this goal by pushing values as <td>
    Object.entries(fnParams.mats).forEach(([key, value]) => {
      if (fnParams.name == "Bound"){
        if (key == "silver") // If bound silver, disable the input and replace value with "--"
          row.push(<td className="read-only" key={key}><input className="invis-input" value="--" disabled/></td>);
        else // If bound mat other than silver, specify change handler
          row.push(<td className="writeable" key={key}><input className="invis-input" defaultValue={value} onChange={(e) => handleBoundMatChange(e, key)}/></td>);
      }
      else // If total or roster, disable the input
        row.push(<td className="read-only" key={key}><input className="invis-input" value={value} disabled/></td>);
    });
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