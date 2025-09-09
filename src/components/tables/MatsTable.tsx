import {type ChangeEvent, type JSX, type RefObject} from 'react';

import {sanitizeInput, saveChanges} from './common';
import {type Materials, addMaterials, initMaterials} from '../core/types';
import {goldValue} from '../core/market-data';
import {loadRosterMats} from '../core/roster-storage';

/** Props interface for MatsTable. */
interface MatsTableProps{
  boundMats: Materials; // Bound materials owned by the character for which this table is being generated
  matsTotalRef: RefObject<Materials>; // Passed to RemTable to avoid re-calculation
  setMats: () => void; // Reference to parent component's state setter
  setRem: () => void; // Reference to parent component's state setter
}

// If true, changes will be committed by saveChanges() on next onBlur event.
let changed: boolean = false;

/** Constructs the "Owned materials" section of the parent table. */
export function MatsTable(props: MatsTableProps): JSX.Element{
  let {boundMats, matsTotalRef, setMats, setRem} = props; // Unpack props

  let matsTable: JSX.Element[] = []; // Initialize table and matsTotal
  matsTotalRef.current = initMaterials();
  let rosterMats: Materials = loadRosterMats();

  matsTotalRef.current = addMaterials(rosterMats, boundMats); // Total mats

  // Build and push each owned materials row to the table
  matsTable.push(<tr key="boundMats">{matsRow({mats: boundMats, name: "Bound"})}</tr>);
  matsTable.push(<tr key="rosterMats">{matsRow({mats: rosterMats, name: "Roster"})}</tr>);
  matsTable.push(<tr className="bold" key="totalMats">{matsRow({mats: matsTotalRef.current, name: "Total"})}</tr>);


  function handleBoundMatChange(e: ChangeEvent<HTMLInputElement>, key: string){
    if (sanitizeInput(e, boundMats[key])){ // Valid numeric input
      matsTotalRef.current[key] += Number(e.target.value) - boundMats[key];
      boundMats[key] = Number(e.target.value); // Update char data
      setMats(); // Update owned materials table
      setRem(); // Update remaining materials table(s)
      changed = true; // Character data will be saved on next focus out
    } // Reject non-numeric input (do nothing)
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
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value={goldValue(fnParams.mats)} disabled/></td>);

    // Build the rest of the table row for this goal by pushing values as <td>
    Object.entries(fnParams.mats).forEach(([key, value]) => {
      if (fnParams.name == "Bound"){
        if (key == "silver") // If bound silver, disable the input and replace value with "--"
          row.push(<td className="read-only" key={key}><input className="invis-input" value="--" disabled/></td>);
        else // If bound mat other than silver, specify change handler
          row.push(<td className="writeable" key={key}>
                     <input
                       className="invis-input"
                       defaultValue={value}
                       onBlur={() => {saveChanges(changed); changed = false}}
                       onChange={(e) => handleBoundMatChange(e, key)}
                     />
                   </td>
          );
      }
      else // If total or roster, disable the input
        row.push(<td className="read-only" key={key}><input className="invis-input" value={value} disabled/></td>);
    });
    return row;
  }

  return(
    <>
      <tr className="bold"><td className="section-title" colSpan={11}>Owned materials</td></tr>
      {matsTable}
    </>
  );
}