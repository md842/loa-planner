import {type JSX, type RefObject} from 'react';

import {Cell} from './Cell';

import {type Goal, type Materials, subMaterials} from '../core/types';
import {goldValue} from '../core/market-data';

/** Props interface for RemTable. */
interface RemTableProps{
  goals: Goal[]; // The character goals or roster goals for this RemTable
  goalsTotalRef?: RefObject<Goal>; // Calculated in GoalTable; passed to RemTable to avoid re-calculation
  matsTotalRef?: RefObject<Materials>; // Calculated in MatsTable; passed to RemTable to avoid re-calculation
  boundMats?: Materials; // If defined, remBoundTable will be rendered.
}

/** Constructs the "Remaining materials" section(s) of the parent table. */
export function RemTable(props: RemTableProps): JSX.Element{
  let {goals, goalsTotalRef, matsTotalRef, boundMats} = props; // Unpack props

  console.log("RemTable rendering");

  let remTable: JSX.Element[] = [], remBoundTable: JSX.Element[] = []; // Initialize tables

  goals.forEach((goal: Goal, index: number) => {
    // Build rows for each goal and push them to the tables
    remTable.push(<tr key={index}>{remRow({goal: goal, isBound: false, subtract: (matsTotalRef) ? matsTotalRef.current : undefined})}</tr>);
    if (boundMats) // Character table; initialize remBoundTable.
      remBoundTable.push(<tr key={index}>{remRow({goal: goal, isBound: true, subtract: boundMats})}</tr>);
  });

  // If all defined, this RemTable is for a character. Build total rows if multiple goals.
  if (goalsTotalRef && matsTotalRef && boundMats && goals.length > 1){
    remTable.push(<tr className="bold" key="totalGoals">{remRow({goal: goalsTotalRef.current, isBound: false, subtract: matsTotalRef.current})}</tr>);
    remBoundTable.push(<tr className="bold" key="totalGoals">{remRow({goal: goalsTotalRef.current, isBound: true, subtract: boundMats})}</tr>);
  } // If roster RemTable, total rows are not needed.

  /**
   * Generate a table row for the "Remaining materials" sections.
   * @param  {Goal}           goal      The goal being used to generate the row.
   * @param  {boolean}        isBound   If true, disable silver (bound silver does not exist).
   * @param  {Materials}      subtract  The materials to subtract from the goal.
   * @return {JSX.Element[]}            The generated table row.
   */
  function remRow(fnParams: {goal: Goal, isBound: boolean, subtract?: Materials}): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal

    // Add goal name to the table row for this goal
    row.push(<Cell key="name" className="goal-name" value={fnParams.goal.name}/>);

    // Subtract specified materials (if defined) from goal materials
    let mats: Materials = (fnParams.subtract) ? subMaterials(fnParams.goal.mats, fnParams.subtract) : fnParams.goal.mats;
    
    // Add calculated gold value to the table row for this goal
    row.push(<Cell key="goldValue" className="bold" value={goldValue(mats)}/>);

    // Build rest of row for this goal by pushing values as Cells
    Object.entries(mats).forEach(([key, value]) => {
      row.push(<Cell key={key} value={(fnParams.isBound && key == "silver") ? "--" : value}/>);
    }); // Always read-only, do not specify change handlers
    return row;
  }

  return(
    <>
      <tr className="bold section-title"><td className="section-title" colSpan={11}>{"Remaining materials"}</td></tr>
      {remTable}
      {(boundMats) &&
      <tr className="bold section-title"><td className="section-title" colSpan={11}>{"Remaining bound materials"}</td></tr>}
      {remBoundTable}
    </>
  );
}