import {type JSX, type RefObject} from 'react';

import {type Goal, type Materials, initMaterials} from '../core/types';
import {goldValue} from '../core/market-data';

/** Props interface for RemTable. */
interface RemTableProps{
  goals: Goal[]; // The character goals or roster goals for this RemTable
  goalsTotalRef: RefObject<Goal>; // Calculated in GoalTable; passed to RemTable to avoid re-calculation
  matsTotalRef: RefObject<Materials>; // Calculated in MatsTable; passed to RemTable to avoid re-calculation
  boundMats?: Materials; // If defined, remBoundTable will be rendered.
}

/** Constructs the "Remaining materials" section(s) of the parent table. */
export function RemTable(props: RemTableProps): JSX.Element{
  let {goals, goalsTotalRef, matsTotalRef, boundMats} = props; // Unpack props

  let remTable: JSX.Element[] = [], remBoundTable: JSX.Element[] = []; // Initialize tables

  goals.forEach((goal: Goal, index: number) => {
    // Build rows for each goal and push it to the tables
    remTable.push(<tr key={index}>{remRow({goal: goal, isBound: false, subtract: matsTotalRef.current})}</tr>);
    if (boundMats) // Character table; initialize remBoundTable.
      remBoundTable.push(<tr key={index}>{remRow({goal: goal, isBound: true, subtract: boundMats})}</tr>);
  });
  if (boundMats && goals.length > 1){ // Character table; build total rows.
    remTable.push(<tr className="bold" key="totalGoals">{remRow({goal: goalsTotalRef.current, isBound: false, subtract: matsTotalRef.current})}</tr>);
    remBoundTable.push(<tr className="bold" key="totalGoals">{remRow({goal: goalsTotalRef.current, isBound: true, subtract: boundMats})}</tr>);
  } // If roster goal table, total rows are not needed.

  /**
   * Generate a table row for the "Remaining materials" sections.
   * @param  {Goal}           goal      The goal being used to generate the row.
   * @param  {boolean}        isBound   If true, disable silver (bound silver does not exist).
   * @param  {Materials}      subtract  The materials to subtract from the goal.
   * @return {JSX.Element[]}            The generated table row.
   */
  function remRow(fnParams: {goal: Goal, isBound: boolean, subtract: Materials}): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal

    // Add goal name to the table row for this goal
    row.push(<td className="read-only" key="name"><input className="invis-input goal-name" value={fnParams.goal.name} disabled/></td>);

    let mats: Materials = initMaterials(); // Create new Materials object
    for (let [key] of Object.entries(mats)){
      mats[key] = Math.max(0, fnParams.goal.mats[key] - fnParams.subtract[key]);
    }
    
    // Add calculated gold value to the table row for this goal
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value={goldValue(mats)} disabled/></td>);

    // Build the rest of the table row for this goal by pushing values as <td>
    Object.entries(mats).forEach(([key, value]) => {
      if (fnParams.isBound && key == "silver") // If bound silver, disable the input and replace value with "--"
        row.push(<td className="read-only" key={key}><input className="invis-input" value="--" disabled/></td>);
      else
        row.push(<td className="read-only" key={key}><input className="invis-input" value={value} disabled/></td>);
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