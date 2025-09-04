import './PlannerTable.css';

import {type JSX, type RefObject, useRef, useState} from 'react';

import {TableHeader} from './tables/TableHeader';
import {GoalTable} from './tables/GoalTable';
import {MatsTable} from './tables/MatsTable';
import {RemTable} from './tables/RemTable';

import {type Goal, type Materials, initMaterials} from './core/types';

import Table from 'react-bootstrap/Table';

/** Props interface for PlannerTable. */
interface PlannerTableProps{
  title: JSX.Element; // Should be a <th> element. Used as the top-left cell of the table.
  goals: Goal[]; // The goals for this PlannerTable.
  boundMats?: Materials; // If defined, this PlannerTable is for a character. If undefined, this GoalTable is for an aggregate.
}

/** Constructs a Table element given a Character object specified by params. */
export function PlannerTable(props: PlannerTableProps): JSX.Element{
  let {title, goals, boundMats} = props; // Unpack props

  // Refs used in initRemTable()
  const goalsTotal: RefObject<Goal> = useRef({name: "Total", mats: initMaterials()});
  const matsTotal: RefObject<Materials> = useRef(initMaterials());

  function initGoals(){
    return GoalTable({goals: goals, goalsTotalRef: goalsTotal, setGoals: () => setGoals(initGoals), setRem: () => setRem(initRem)});
  }
  function initMats(){
    return MatsTable({matsTotalRef: matsTotal, boundMats: boundMats, setMats: () => setMats(initMats), setRem: () => setRem(initRem)});
  }
  function initRem(){
    return RemTable({goals: goals, goalsTotalRef: goalsTotal, matsTotalRef: matsTotal, boundMats: boundMats});
  }

  const [goalsTable, setGoals] = useState(initGoals);
  const [matsTable, setMats] = useState(initMats);
  const [remTable, setRem] = useState(initRem);

  // Ref used by saveChanges(). true: unsaved changes to commit
  //const changed: RefObject<boolean> = useRef(false);

  return(
    <Table hover>
      <TableHeader title={title}/>
      <tbody>
        {goalsTable}
        {matsTable}
        {remTable}
      </tbody>
    </Table>
  );
}

/*
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
*/