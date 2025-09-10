import {type JSX, type RefObject, useRef, useState} from 'react';

import {TableHeader} from './tables/TableHeader';
import {CharacterGoalTable} from './tables/CharacterGoalTable';
import {MatsTable} from './tables/MatsTable';
import {RemTable} from './tables/RemTable';

import {type Character, type Goal, type Materials, initMaterials} from './core/types';
import {saveCharParams} from './core/character-data';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

/** Props interface for CharacterTable. */
interface CharacterCardProps{
  char: Character;
  index: number; // Index of character, used for data organization
  // References to parent component state/state setters
  handleDelete: (index: number) => void;
  handleSwap: (index: number, direction: number) => void;
  updateRosterGoals: () => void;
  updateRosterRem: () => void;
}

/** Constructs a table for a single character. */
export function CharacterCard(props: CharacterCardProps): JSX.Element{
  let {char, index, handleDelete, handleSwap, updateRosterGoals, updateRosterRem} = props; // Unpack props

  // Load initial character info into state so SettingsModal can change them
  const [charState, setCharState] = useState({name: char.name, ilvl: char.ilvl, class: char.class, usesClassColor: char.usesClassColor, color: char.color});
  const [modalVis, setModalVis] = useState(false); // SettingsModal visibility

  // Set table color to the character's saved color
  document.documentElement.style.setProperty("--table-color", charState.color);

  // Refs used in RemTable
  const goalsTotal: RefObject<Goal> = useRef({name: "Total", mats: initMaterials()});
  const matsTotal: RefObject<Materials> = useRef(initMaterials());

  // Table state variables
  const [goalsTable, setGoals] = useState(initGoals);
  const [matsTable, setMats] = useState(initMats);
  const [remTable, setRem] = useState(initRem);

  // Set up table state variables
  function initGoals(){
    return CharacterGoalTable({goals: char.goals, goalsTotalRef: goalsTotal, index: index, setGoals: () => setGoals(initGoals), setRem: () => setRem(initRem), updateRosterGoals: updateRosterGoals, updateRosterRem: updateRosterRem});
  }
  function initMats(){
    return MatsTable({matsTotalRef: matsTotal, boundMats: char.boundMats, setMats: () => setMats(initMats), setRem: () => setRem(initRem), updateRosterRem: updateRosterRem});
  }
  function initRem(){
    return RemTable({goals: char.goals, goalsTotalRef: goalsTotal, matsTotalRef: matsTotal, boundMats: char.boundMats});
  }

  function SettingsModal(){
    const [colorPickerDisabled, setColorPickerDisabled] = useState(charState.usesClassColor);
    const classNames: string[] = ["Aeromancer", "Arcanist", "Artillerist",
    "Artist", "Bard", "Berserker", "Breaker", "Deadeye", "Deathblade",
    "Destroyer", "Glaivier", "Gunlancer", "Gunslinger", "Machinist", "Paladin",
    "Reaper", "Scrapper", "Shadowhunter", "Sharpshooter", "Slayer",
    "Sorceress", "Souleater", "Soulfist", "Striker", "Summoner", "Valkyrie",
    "Wardancer", "Wildsoul"];
    const classColorDict: {[className: string]: string} = {
      "Aeromancer": "#084BA3",
      "Arcanist": "#B38915",
      "Artillerist": "#33670B",
      "Artist": "#A34AF0",
      "Bard": "#674598",
      "Berserker": "#EE2E48",
      "Breaker": "#4DE3D1",
      "Deadeye": "#4442A8",
      "Deathblade": "#A91A16",
      "Destroyer": "#7B9AA2",
      "Glaivier": "#F6DA6A", 
      "Gunlancer": "#E1907E",
      "Gunslinger": "#6BCEC2",
      "Machinist": "#3B4292",
      "Paladin": "#FF9900",
      "Reaper": "#109618",
      "Scrapper": "#990099",
      "Shadowhunter": "#0099C6",
      "Sharpshooter": "#DD4477",
      "Slayer": "#DB6A42", 
      "Sorceress": "#66AA00",
      "Souleater": "#C16ED0",
      "Soulfist": "#316395",
      "Striker": "#994499",
      "Summoner": "#22AA99",
      "Valkyrie": "#FFBF00",
      "Wardancer": "#AAAA11",
      "Wildsoul": "#3A945E"
    };

    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
      // Extract form information
      let target: HTMLFormElement = e.target as HTMLFormElement;
      let name: string = (target[0] as HTMLFormElement).value;
      let ilvl: string = (target[1] as HTMLFormElement).value;
      let charClass: string = (target[2] as HTMLFormElement).value;
      let usesClassColor: boolean = (target[3] as HTMLFormElement).checked;

      // Use class color by default; get color using class name as key
      let color: string = classColorDict[charClass];
      if (!usesClassColor) // Custom color specified
        color = (target[4] as HTMLFormElement).value; // Get color from form

      // Update (re-render) character info in top left of table
      setCharState({name: name, ilvl: ilvl, class: charClass, usesClassColor: usesClassColor, color: color});
      saveCharParams(index, name, ilvl, charClass, usesClassColor, color);
      setModalVis(false); // Close modal
    }

    return(
      <Modal show={modalVis} centered>
        <Modal.Header>
          <Modal.Title>Character Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => handleSubmit(e)}>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon3">Name</InputGroup.Text>
              <Form.Control defaultValue={charState.name}/>
            </InputGroup>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon3">Item Level</InputGroup.Text>
              <Form.Control defaultValue={charState.ilvl} type="number" step="0.01"/>
            </InputGroup>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon3">Class</InputGroup.Text>
              <Form.Select defaultValue={charState.class}>
                { /* Populate class dropdown with classNames */
                classNames.map((name: string) => {
                  return(<option key={name} value={name}>{name}</option>);
                })}
              </Form.Select>
            </InputGroup>
            <Form.Check
              className="mb-3"
              type="checkbox"
              label="Use class color"
              defaultChecked={charState.usesClassColor}
              onChange={(e) => setColorPickerDisabled(e.target.checked)}
            />
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon3">Custom color</InputGroup.Text>
              <Form.Control
                type="color"
                defaultValue={charState.color}
                disabled={colorPickerDisabled}
              />
            </InputGroup>
            <Button variant="primary" type="submit">Save</Button>
            <Button variant="primary" onClick={() => setModalVis(false)}>Cancel</Button>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  return(
    <div style={{"--table-color": charState.color} as React.CSSProperties}>
      <SettingsModal/> {/* Hidden until setModalVis(true) onClick*/}
      <div className="settings-tab">
        <Button variant="link" onClick={() => setModalVis(true)}>
          <i className="bi bi-gear-fill"/>
        </Button>
        <Button variant="link" onClick={() => handleSwap(index, -1)}> {/* direction -1 represents up */}
          <i className="bi bi-chevron-up"/>
        </Button>
        <Button variant="link" onClick={() => handleSwap(index, 1)}> {/* direction 1 represents down */}
          <i className="bi bi-chevron-down"/>
        </Button>
        <Button variant="link" onClick={() => handleDelete(index)}>
          <i className="bi bi-trash3-fill"/>
        </Button>
      </div>
      <Table hover>
        <TableHeader title={<th>{charState.name}<br/>{charState.ilvl} {charState.class}</th>}/>
        <tbody>
          {goalsTable}
          {matsTable}
          {remTable}
        </tbody>
      </Table>
    </div>
  );
}