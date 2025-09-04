import {type JSX, type RefObject, useRef, useState} from 'react';

import {TableHeader} from './tables/TableHeader';
import {GoalTable} from './tables/GoalTable';
import {RemTable} from './tables/RemTable';

import {type Character, type Goal, type Materials, initMaterials} from './core/types';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

/** Props interface for AggregateTable. */
interface AggregateTableProps{
  chars: Character[];
}

/** Constructs the table for roster goal aggregates. */
export function AggregateTable(props: AggregateTableProps): JSX.Element{
  let {chars} = props; // Unpack props

  const [modalVis, setModalVis] = useState(false); // SettingsModal visibility

  // Refs used in RemTable
  const goalsTotal: RefObject<Goal> = useRef({name: "Total", mats: initMaterials()});
  const matsTotal: RefObject<Materials> = useRef(initMaterials());

  // Set up table state variables
  function initGoals(){
    return GoalTable({goals: chars[0].goals, goalsTotalRef: goalsTotal, setGoals: () => setGoals(initGoals), setRem: () => setRem(initRem)});
  }
  function initRem(){
    return RemTable({goals: chars[0].goals, goalsTotalRef: goalsTotal, matsTotalRef: matsTotal});
  }
  
  // Table state variables
  const [goalsTable, setGoals] = useState(initGoals);
  const [remTable, setRem] = useState(initRem);

  function SettingsModal(){
    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
      console.log("Event:", e);
      setModalVis(false); // Close modal
    }

    return(
      <Modal show={modalVis} centered>
        <Modal.Header>
          <Modal.Title>Goal Aggregate Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => handleSubmit(e)}>
            <Button variant="primary" type="submit">Save</Button>
            <Button variant="primary" onClick={() => setModalVis(false)}>Cancel</Button>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  return(
    <div style={{"--table-color": "#777"} as React.CSSProperties}>
      <SettingsModal/> {/* Hidden until setModalVis(true) onClick*/}
      <div className="settings-tab">
        <Button variant="link" onClick={() => setModalVis(true)}>
          <i className="bi bi-gear-fill"/>
        </Button>
        <Button variant="link">
          <i className="bi bi-chevron-up"/>
        </Button>
        <Button variant="link">
          <i className="bi bi-chevron-down"/>
        </Button>
      </div>
      <Table hover>
        <TableHeader title={<th>Roster Goals</th>}/>
        <tbody>
          {goalsTable}
          {remTable}
        </tbody>
      </Table>
    </div>
  );
}