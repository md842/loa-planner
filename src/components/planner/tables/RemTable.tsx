import {type ReactNode, type RefObject, useEffect, useState} from 'react';

import {Cell} from './Cell';

import {type Goal, type Materials, subMaterials} from '../../core/types';
import {goldValue} from '../../core/market-data';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

/** Props interface for RemTable. */
interface RemTableProps{
  goals: Goal[]; // The character goals or roster goals for this RemTable
  boundMats?: Materials; // If defined, character RemTable; remBoundTable will be rendered.
  // Refs passed to character RemTable to avoid re-calculation
  matsTotalRef?: RefObject<Materials>; // Calculated in MatsTable
  // References to parent component state/state setters
  charRemUpdateSignal?: number[];
}

/** Constructs the "Remaining materials" section(s) of the parent table. */
export function RemTable(props: RemTableProps): ReactNode{
  let {goals, boundMats, matsTotalRef, charRemUpdateSignal} = props; // Unpack props

  /* Table state variable for remaining materials (character or roster).
     Will be initialized when useEffect runs on mount, so initialize blank. */
  const [table, updateTable] = useState([] as ReactNode[][]);

  // Update signal handlers
  useEffect(() => { // RosterCard RemTable update hook
    updateTable(initTable); // Re-render entire remaining materials table
  }, [goals]); // Runs on mount and when table goals change

  useEffect(() => { // CharacterCard RemTable update hook
    // Allows updating individual rows of an initialized character RemTable.
    if (table[1]){ // Character's remBoundTable is initialized
      if (charRemUpdateSignal!.length == 0) // Empty signal from MatsTable
        updateTable(initTable); // Re-render entire remaining materials table
    } // Do nothing if not an initialized character RemTable
  }, [charRemUpdateSignal]); // Runs on mount and when update signal received
  
  function initTable(): ReactNode[][]{ // Table state initializer function
    let remTable: ReactNode[] = [], remBoundTable: ReactNode[] = []; // Initialize tables
            
    for (let i = 0; i < goals.length; i++){ // Build row for each goal
      // If !boundMats, this is a RosterCard RemTable, no "Total" goal. Else:
      // If goals.length == 1, char has no goals (only "Total"), render nothing
      // If goals.length == 2, char has only one goal, skip rendering "Total"
      if (!boundMats || goals.length > 2 || (goals.length == 2 && i == 0)){
        remTable.push(
          <RemRow key={i}
            // If character (boundMats is defined), last goal is "Total"
            total={boundMats && i == goals.length - 1}
            goal={goals[i]}
            subtract={(matsTotalRef) ? matsTotalRef.current : undefined}
          />
        );
        if (boundMats){ // Character table; initialize remBoundTable.
          remBoundTable.push(
            <RemRow bound key={i}
              total={i == goals.length - 1} // Last goal is "Total"
              goal={goals[i]}
              subtract={boundMats}
            />
          );
        }
      }
    }
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
  function RemRow(props: {bound?: boolean, total?: boolean, goal: Goal, subtract?: Materials}): ReactNode{
    let cells: ReactNode[] = []; // Initialize table row for this goal

    // Add goal name to the table row for this goal
    cells.push(<Cell key="id" colSpan={2} value={props.goal.id}/>);

    // Subtract specified materials (if defined) from goal materials
    let mats: Materials = (props.subtract) ? subMaterials(props.goal.mats, props.subtract) : props.goal.mats;
    
    // Add calculated gold value to the table row for this goal
    cells.push(<Cell bold key="goldValue" value={goldValue(mats)}/>);

    // Build rest of row for this goal by pushing values as Cells
    Object.entries(mats).forEach(([key, value]) => {
      cells.push(<Cell key={key} value={(props.bound && key == "silver") ? "--" : value}/>);
    }); // Always read-only, do not specify change handlers

    return(
      <Row className={props.total ? "bold table-row" : "table-row"}>
        {cells}
      </Row>
    );
  }

  return(
    <>
      <Container className="container-table m-0">
        <Row className="table-head">
          <Col className="bold section-title" xs={12}>Remaining materials</Col>
        </Row>
        {table[0]}
      </Container>

      {(boundMats) &&
        <Container className="container-table m-0">
          <Row className="table-head">
            <Col className="bold section-title" xs={12}>Remaining bound materials</Col>
          </Row>
          {table[1]}
        </Container>
      }
    </>
  );
}