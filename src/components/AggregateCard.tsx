import './AggregateCard.css';

import {type JSX, useState} from 'react';

import {PlannerTable} from '../components/PlannerTable';
import {type Character} from './core/types';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

/** Props interface for CharacterCard(). */
interface AggregateCardProps{
  chars: Character[];
  //handleSwap: (index: number, direction: number) => void;
}

/** Constructs a Table element given a Character object specified by params. */
export function AggregateCard(props: AggregateCardProps): JSX.Element{
  let {chars} = props; // Unpack props

  const [modalVis, setModalVis] = useState(false); // SettingsModal visibility

  function SettingsModal(){
    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
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
      <PlannerTable
        title={<th>Roster Goals</th>}
        goals={chars[0].goals}
      />
    </div>
  );
}