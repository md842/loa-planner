import {type ChangeEvent, type JSX, type RefObject, useRef, useState} from 'react';

import {type Materials, initMaterials} from '../core/types';
import {saveChars} from '../core/character-data';
import {goldValue} from '../core/market-data';
import {loadRosterMats} from '../core/roster-storage';

/** Props interface for MatsTable. */
interface MatsTableProps{
  matsTotalRef: RefObject<Materials>;
  boundMats: Materials; // If defined, this RemTable is for a character. If undefined, this GoalTable is for an aggregate.
  setRem: React.Dispatch<React.SetStateAction<JSX.Element>>;
  initRem: () => JSX.Element;
}

/** Constructs a Table element given a Character object specified by params. */
export function MatsTable(props: MatsTableProps): JSX.Element{
  let {matsTotalRef, boundMats, setRem, initRem} = props; // Unpack props

  console.log("MatsTable rendering.");

  // Ref used by saveChanges(). true: unsaved changes to commit
  const changed: RefObject<boolean> = useRef(false);

  // Table state variables
  const [matsTable, setMats] = useState(initMatsTable);

  function initMatsTable(): JSX.Element[]{
    let workingTable: JSX.Element[] = []; // Initialize table and matsTotal

    matsTotalRef.current = initMaterials();
    let rosterMats: Materials = loadRosterMats();

    // Accumulate total materials
    for (let [key, value] of Object.entries(rosterMats))
      matsTotalRef.current[key] = boundMats[key] + value;
    matsTotalRef.current["silver"] = rosterMats["silver"];

    // Build and push each owned materials row
    workingTable.push(<tr key="boundMats">{matsRow({mats: boundMats, name: "Bound"})}</tr>);
    workingTable.push(<tr key="rosterMats">{matsRow({mats: rosterMats, name: "Roster"})}</tr>);
    workingTable.push(<tr className="bold" key="totalMats">{matsRow({mats: matsTotalRef.current, name: "Total"})}</tr>);
    
    return workingTable; // Return table to state initializer
  }

  function handleBoundMatChange(e: ChangeEvent<HTMLInputElement>, key: string){
    if (boundMats){
      if (sanitizeInput(e, boundMats[key])){ // Checks valid numeric input
        /* Size of this section is static, so only the total row needs updating,
          and re-initialization can be avoided for performance reasons. */
        matsTotalRef.current[key] += Number(e.target.value) - boundMats[key];
        boundMats[key] = Number(e.target.value); // Update char data
        
        // Replace existing total row in matsTable with newly generated total row
        let matsTotalRow = <tr className="bold" key="totalMats">{matsRow({mats: matsTotalRef.current, name: "Total"})}</tr>;
        setMats([...matsTable.slice(0, -1), matsTotalRow]); // Update mats table
        setRem(initRem); // Update remaining materials tables
        changed.current = true; // Character data will be saved on next focus out
      } // Reject non-numeric input (do nothing)
    }
  }

  function saveChanges(){
    if (changed.current){ // Check for unsaved changes
      saveChars(); // Save updated character data
      changed.current = false; // Mark changes as committed
    }
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
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value={goldValue(fnParams.mats)} disabled/></td>); // TODO: Calculate value using market data once implemented.

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
                       onBlur={saveChanges}
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