import {type JSX, type RefObject} from 'react';

import {type Goal, type Materials, initMaterials} from '../core/types';
import {goldValue} from '../core/market-data';

/** Props interface for RemTable. */
interface RemTableProps{
  goals: Goal[]; // The goals for this RemTable.
  goalsTotalRef: RefObject<Goal>; // Calculated in GoalTable; passed as ref to RemTable to avoid re-calculation
  matsTotalRef: RefObject<Materials>; // Calculated in MatsTable; passed as ref to RemTable to avoid re-calculation
  boundMats?: Materials; // If defined, this RemTable is for a character. If undefined, this GoalTable is for an aggregate.
}

/** Constructs a Table element given a Character object specified by params. */
export function RemTable(props: RemTableProps): JSX.Element{
  let {goals, goalsTotalRef, matsTotalRef, boundMats} = props; // Unpack props

  console.log("RemTable rendering.");

  let remTable: JSX.Element[] = [], remBoundTable: JSX.Element[] = []; // Initialize tables

  goals.forEach((goal: Goal, index: number) => {
    // Build rows for each goal and push it to the tables
    remTable.push(<tr key={index}>{remRow({goal: goal, isTotal: false, subtract: matsTotalRef.current})}</tr>);
    if (boundMats) // Character table; initialize remBoundTable.
      remBoundTable.push(<tr key={index}>{remRow({goal: goal, isTotal: false, subtract: boundMats})}</tr>);
  });
  if (boundMats && goals.length > 1){ // Character table; build total rows.
    remTable.push(<tr className="bold" key="totalGoals">{remRow({goal: goalsTotalRef.current, isTotal: true, subtract: matsTotalRef.current})}</tr>);
    remBoundTable.push(<tr className="bold" key="totalGoals">{remRow({goal: goalsTotalRef.current, isTotal: true, subtract: boundMats})}</tr>);
  } // If aggregate table, total rows are not needed.

  /**
   * Generate a table row for the "Remaining materials" sections.
   * @param  {Goal}           goal      The goal being used to generate the row.
   * @param  {boolean}        isTotal   If true, this row represents a section total.
   * @param  {Materials}      subtract  The materials to subtract from the goal.
   * @return {JSX.Element[]}            The generated table row.
   */
  function remRow(fnParams: {goal: Goal, isTotal: boolean, subtract: Materials}): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal

    // Add goal name to the table row for this goal
    row.push(<td className="read-only" key="name"><input className="invis-input goal-name" value={fnParams.goal.name} disabled/></td>);

    let mats: Materials = initMaterials(); // Create new Materials object
    for (let [key] of Object.entries(mats)){
      if (fnParams.goal.mats[key] == null || fnParams.subtract[key] == null)
        mats[key] = NaN; // Bound silver is stored as null, should be NaN
      else // Subtract owned mats from goal mats
        mats[key] = Math.max(0, fnParams.goal.mats[key] - fnParams.subtract[key]);
    }
    
    // Add calculated gold value to the table row for this goal
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value={goldValue(mats)} disabled/></td>); // TODO: Calculate value using market data once implemented.

    // Build the rest of the table row for this goal by pushing values as <td>
    Object.entries(mats).forEach(([key, value]) => {
      row.push(<td className="read-only" key={key}><input className="invis-input" value={Number.isNaN(value) ? "--" : value} disabled/></td>);
    });
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