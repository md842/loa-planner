import {type JSX, type RefObject, useEffect, useState} from 'react';

import {Cell} from './Cell';

import {type Goal, type Materials, subMaterials} from '../../core/types';
import {goldValue} from '../../core/market-data';

/** Props interface for RemTable. */
interface RemTableProps{
  goals: Goal[]; // The character goals or roster goals for this RemTable
  boundMats?: Materials; // If defined, character RemTable; remBoundTable will be rendered.
  // Refs passed to character RemTable to avoid re-calculation
  goalsTotalRef?: RefObject<Goal>; // Calculated in CharacterGoalTable
  matsTotalRef?: RefObject<Materials>; // Calculated in MatsTable
  // References to parent component state/state setters
  charRemUpdateSignal?: number[];
}

/** Constructs the "Remaining materials" section(s) of the parent table. */
export function RemTable(props: RemTableProps): JSX.Element{
  let {goals, boundMats, goalsTotalRef, matsTotalRef, charRemUpdateSignal} = props; // Unpack props

  /* Table state variable for remaining materials (character or roster).
     Will be initialized when useEffect runs on mount, so initialize blank. */
  const [table, updateTable] = useState([] as JSX.Element[][]);

  // Update signal handlers
  useEffect(() => { // RosterCard RemTable update hook
    updateTable(initTable); // Re-render entire remaining materials table
  }, [goals]); // Runs on mount and when table goals change

  useEffect(() => { // CharacterCard RemTable update hook
    // Allows updating individual rows of an initialized character RemTable.
    if (table[1]){ // Character's remBoundTable is initialized
      if (charRemUpdateSignal!.length == 0) // Empty signal from MatsTable
        updateTable(initTable); // Re-render entire remaining materials table
      else{ // Non-empty signal from CharacterGoalTable (contains a goal index)
        let index: number = charRemUpdateSignal![0]; // Unpack signal index
        updateTable([
          [ // Update remTable (table[0])
            ...table[0].slice(0, index), // Goals before specified index
            // Skip row if goals.length == index (signal sent by removeGoal)
            (goals.length > index) ? <RemRow key={index} goal={goals[index]} subtract={matsTotalRef!.current}/> : undefined,
            ...table[0].slice(index + 1, -1), // Goals after specified index
            <RemRow total key="total" goal={goalsTotalRef!.current} subtract={matsTotalRef!.current}/>,
          ] as JSX.Element[],
          [ // Update remBoundTable (table[1])
            ...table[1].slice(0, index), // Goals before specified index
            // Skip row if goals.length == index (signal sent by removeGoal)
            (goals.length > index) ? <RemRow bound key={index} goal={goals[index]} subtract={boundMats}/> : undefined,
            ...table[1].slice(index + 1, -1), // Goals after specified index
            <RemRow bound total key="total" goal={goalsTotalRef!.current} subtract={boundMats}/>,
          ] as JSX.Element[],
        ]); // Only re-renders the rows being updated and the total rows
      }
    } // Do nothing if not an initialized character RemTable
  }, [charRemUpdateSignal]); // Runs on mount and when update signal received
  
  function initTable(): JSX.Element[][]{ // Table state initializer function
    let remTable: JSX.Element[] = [], remBoundTable: JSX.Element[] = []; // Initialize tables

    goals.forEach((goal: Goal, index: number) => {
      // Build rows for each goal and push them to the tables
      remTable.push(<RemRow key={index} goal={goal} subtract={(matsTotalRef) ? matsTotalRef.current : undefined}/>);
      if (boundMats) // Character table; initialize remBoundTable.
        remBoundTable.push(<RemRow bound key={index} goal={goal} subtract={boundMats}/>);
    });

    // If all defined, this RemTable is for a character. Build total rows if multiple goals.
    if (goalsTotalRef && matsTotalRef && boundMats && goals.length > 1){
      remTable.push(<RemRow total key="total" goal={goalsTotalRef.current} subtract={matsTotalRef.current}/>);
      remBoundTable.push(<RemRow bound total key="total" goal={goalsTotalRef.current} subtract={boundMats}/>);
    } // If roster RemTable, total rows are not needed.
    return [remTable, remBoundTable];
  }

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

    // console.log("RemRow rendering");

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

    return <tr className={props.total ? "bold" : undefined}>{cells}</tr>;
  }

  return(
    <>
      <tr className="bold section-title"><td className="section-title" colSpan={11}>{"Remaining materials"}</td></tr>
      {table[0]}
      {(boundMats) &&
      <tr className="bold section-title"><td className="section-title" colSpan={11}>{"Remaining bound materials"}</td></tr>}
      {table[1]}
    </>
  );
}