import {type JSX, type RefObject} from 'react';

import {Cell} from './Cell';

import {type Goal, type Materials, subMaterials} from '../../core/types';
import {goldValue} from '../../core/market-data';

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
    remTable.push(<RemRow key={index} goal={goal} subtract={(matsTotalRef) ? matsTotalRef.current : undefined}/>);
    if (boundMats) // Character table; initialize remBoundTable.
      remBoundTable.push(<RemRow bound key={index} goal={goal} subtract={boundMats}/>);
  });

  // If all defined, this RemTable is for a character. Build total rows if multiple goals.
  if (goalsTotalRef && matsTotalRef && boundMats && goals.length > 1){
    remTable.push(<RemRow total key="totalGoals" goal={goalsTotalRef.current} subtract={matsTotalRef.current}/>);
    remBoundTable.push(<RemRow bound total key="totalGoals" goal={goalsTotalRef.current} subtract={boundMats}/>);
  } // If roster RemTable, total rows are not needed.

  /**
   * Generate a table row for the "Remaining materials" sections.
   * @param  {boolean}        bound     If true, disable silver (bound silver does not exist).
   * @param  {boolean}        total     If true, the entire row uses bold font weight.
   * @param  {Goal}           goal      The goal being used to generate the row.
   * @param  {Materials}      subtract  The materials to subtract from the goal.
   * @return {JSX.Element[]}            The generated table row.
   */
  function RemRow(props: {bound?: boolean, total?: boolean, goal: Goal, subtract?: Materials}): JSX.Element{
    let cells: JSX.Element[] = []; // Initialize table row for this goal

    // Add goal name to the table row for this goal
    cells.push(<Cell key="name" className="first-col" value={props.goal.name}/>);

    // Subtract specified materials (if defined) from goal materials
    let mats: Materials = (props.subtract) ? subMaterials(props.goal.mats, props.subtract) : props.goal.mats;
    
    // Add calculated gold value to the table row for this goal
    cells.push(<Cell bold key="goldValue" value={goldValue(mats)}/>);

    // Build rest of row for this goal by pushing values as Cells
    Object.entries(mats).forEach(([key, value]) => {
      cells.push(<Cell key={key} value={(props.bound && key == "silver") ? "--" : value}/>);
    }); // Always read-only, do not specify change handlers

    return <tr className={(props.total) ? "bold" : undefined}>{cells}</tr>;
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