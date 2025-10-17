import {type ChangeEvent, type ReactNode, type RefObject, useState} from 'react';

import {Cell} from './Cell';

import {type Materials, addMaterials, initMaterials} from '../../core/types';
import {sanitizeInput, saveChanges} from './common';
import {goldValue} from '../../core/market-data';
import {getRosterMats} from '../../core/roster-storage-data';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

/** Props interface for MatsTable. */
interface MatsTableProps{
  boundMats: Materials; // Bound materials owned by the character for which this table is being generated
  matsTotalRef: RefObject<Materials>; // Passed to RemTable to avoid re-calculation
  // References to parent component state/state setters
  updateCharRem: () => void;
  updateRosterRem: () => void;
}

// If true, changes will be committed by saveChanges() on next onBlur event.
let changed: boolean = false;

/** Constructs the "Owned materials" section of the parent table. */
export function MatsTable(props: MatsTableProps): ReactNode{
  let {boundMats, matsTotalRef, updateCharRem, updateRosterRem} = props; // Unpack props

  // Table state variable for owned materials.
  const [table, updateTable] = useState(initTable);

  function initTable(): ReactNode[]{ // Table state initializer function
    let table: ReactNode[] = []; // Initialize table and matsTotal
    matsTotalRef.current = initMaterials();

    let rosterMats: Materials = getRosterMats();
    matsTotalRef.current = addMaterials(rosterMats, boundMats); // Total mats

    // Build and push each owned materials row to the table
    table.push(<MatsRow key="bound" mats={boundMats} name={"Bound"}/>);
    table.push(<MatsRow key="roster" mats={rosterMats} name={"Roster"}/>);
    table.push(<MatsRow key="total" mats={matsTotalRef.current} name={"Total"}/>);
    return table;
  }

  function handleBoundMatChange(e: ChangeEvent<HTMLInputElement>, key: string){
    if (sanitizeInput(e, boundMats[key])){ // Valid numeric input
      matsTotalRef.current[key] += Number(e.target.value) - boundMats[key];
      boundMats[key] = Number(e.target.value); // Update char data

      updateTable([
        <MatsRow key="bound" mats={boundMats} name="Bound"/>,
        table[1], // Roster materials row
        <MatsRow key="total" mats={matsTotalRef.current} name={"Total"}/>,
      ]); // Only re-renders the row being updated and the total row

      updateCharRem(); // Update remaining materials table(s)
      updateRosterRem(); // Send signal to update RosterCard remTable
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
  function MatsRow(props: {mats: Materials, name: string}): ReactNode{
    let {mats, name} = props; // Unpack props
    let cells: ReactNode[] = []; // Initialize table row for this goal

    // Add goal name and calculated gold value to the table row for this goal
    cells.push(<Cell bold key="name" colSpan={2} value={name}/>);
    cells.push(<Cell bold key="goldValue" value={goldValue(mats)}/>);

    // Build rest of row for this goal by pushing values as Cells
    Object.entries(mats).forEach(([key, value]) => {
      if (name == "Bound"){
        if (key == "silver") // If bound silver, replace the input with "--"
          cells.push(<Cell key={key} value="--"/>);
        else // Always writeable if bound mat other than silver
          cells.push(
            <Cell key={key} value={value}
              onBlur={() => {saveChanges(changed); changed = false}}
              onChange={(e) => handleBoundMatChange(e, key)}
            /> // Specify change handlers for writeable field
          );
      }
      else // Always read-only if total or roster mats
        cells.push(<Cell key={key} value={value}/>);
    });

    return(
      <Row className={name == "Total" ? "bold table-row" : "table-row"}>
        {cells}
      </Row>
    );
  }

  return(
    <Container className="container-table m-0">
      <Row className="table-head">
        <Col className="bold section-title" xs={12}>Owned materials</Col>
      </Row>
      {table}
    </Container>
  );
}