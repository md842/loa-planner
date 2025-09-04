import './PlannerTable.css';

import {type JSX, type RefObject, useRef, useState} from 'react';

import {GoalTable} from './tables/GoalTable';
import {MatsTable} from './tables/MatsTable';
import {RemTable} from './tables/RemTable';

import {type Goal, type Materials, initMaterials} from './core/types';

import gold from '../assets/gold.png';
import silver from '../assets/silver.png';
import t4_blue from '../assets/t4_blue.png';
import t4_blueSolar from '../assets/t4_bluesolar.png';
import t4_fusion from '../assets/t4_fusion.png';
import t4_leap from '../assets/t4_leap.png';
import t4_red from '../assets/t4_red.png';
import t4_redSolar from '../assets/t4_redsolar.png';
import t4_shard from '../assets/t4_shard.png';

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
      <thead>
        <tr>
          {title}
          <th>Gold Value</th>
          <th><img src={silver}/></th>
          <th><img src={gold}/></th>
          <th><img src={t4_shard}/></th>
          <th><img src={t4_fusion}/></th>
          <th><img src={t4_red}/></th>
          <th><img src={t4_blue}/></th>
          <th><img src={t4_leap}/></th>
          <th><img src={t4_redSolar}/></th>
          <th><img src={t4_blueSolar}/></th>
        </tr>
      </thead>
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