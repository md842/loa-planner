import {type ChangeEvent, type ReactNode, type RefObject, useRef, useState} from 'react';

import {TableHeader} from '../tables/TableHeader';
import {CharacterGoalTable} from '../tables/CharacterGoalTable';
import {MatsTable} from '../tables/MatsTable';
import {RemTable} from '../tables/RemTable';

import {type Character, type Goal, type Materials, charNameUnique, initMaterials} from '../../core/types';
import {getChars, saveCharParams} from '../../core/character-data';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';

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
export function CharacterCard(props: CharacterCardProps): ReactNode{
  let {char, index, handleDelete, handleSwap,
       updateRosterGoals, updateRosterRem} = props; // Unpack props

  // Load initial character info into state so SettingsModal can change them
  const [charState, setCharState] = useState({
    name: char.name,
    ilvl: char.ilvl,
    class: char.class,
    usesClassColor: char.usesClassColor,
    color: char.color
  });

  /* Configuring a new character replaces char.class with a value from the
     class dropdown, so only a new character has this placeholder class. For
     new characters, show ConfigModal by default, otherwise hide by default. */
  let isNewChar: boolean = char.class == "(New Character)";
  const [modalVis, setModalVis] = useState(isNewChar); // ConfigModal visibility

  // Table state variable for materials sources
  const [goals, setGoals] = useState(char.goals);

  // Ref used in RemTable to avoid re-calculation
  const matsTotal: RefObject<Materials> = useRef(initMaterials());

  /* Character state update signal; uses array signal type because
     sendSignal([]) is guaranteed to update state with a new value. */
  const [charRemUpdateSignal, sendCharRemSignal] = useState([0]);

  /** Updates goal goalIndex and goal total. */
  function setGoal(goalIndex: number, id?: string, key?: keyof Materials, value?: number){
    // Deep copy target goal and total goal from state variable
    let goal: Goal = JSON.parse(JSON.stringify(goals[goalIndex]));
    let total: Goal = JSON.parse(JSON.stringify(goals[goals.length - 1]));

    if (id != undefined) // If defined, update goal.id
      goal.id = id;
    if (key){ // If defined, update goal.mats[key] and goalsTotal
      total.mats[key] -= goal.mats[key]; // Subtract old amount from total
      goal.mats[key] = value!; // Update goal mat amount
      total.mats[key] += value!; // Add new amount to total
    }

    setGoals([ // Update goals state variable
      ...goals.slice(0, goalIndex), // Goals before specified index
      goal,
      ...goals.slice(goalIndex + 1, -1), // Goals after specified index
      total
    ]);
  }

  function ConfigModal(){
    const [colorPickerDisabled, setColorPickerDisabled] = useState(charState.usesClassColor);

    // Allows disabling "Save" button when name is empty or not unique
    const [customName, setCustomName] = useState(charState.name);
    const [uniqueName, setUniqueName] = useState(true);

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

    /** Handles the controlled character name input. */
    function handleNameChange(e: ChangeEvent<HTMLInputElement>){
      if (e.target.value.length < 16){ // Under length limit, accept input
        setCustomName(e.target.value); // Update controlled name input
        // Search for name in chars; false if found
        setUniqueName(charNameUnique(getChars(), e.target.value, index));
      }
    }

    /** Called when clicking "Save" in the modal footer. */
    function saveChanges(e: React.FormEvent<HTMLFormElement>){
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
      setCharState({
        name: name,
        ilvl: ilvl,
        class: charClass,
        usesClassColor: usesClassColor,
        color: color
      });
      saveCharParams(index, name, ilvl, charClass, usesClassColor, color);
      setModalVis(false); // Close modal
    }

    return(
      <Modal show={modalVis} centered>
        <Modal.Header>
          <Modal.Title>{isNewChar ? "Configure New Character" : "Configure Character: " + charState.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => saveChanges(e)}>
          <Modal.Body>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon3">Name</InputGroup.Text>
              <Form.Control
                value={customName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(e)}
              />
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
              label="Use default class color"
              defaultChecked={charState.usesClassColor}
              onChange={(e) => setColorPickerDisabled(e.target.checked)}
            />
            <InputGroup>
              <InputGroup.Text id="basic-addon3">Custom color</InputGroup.Text>
              <Form.Control
                type="color"
                defaultValue={charState.color}
                disabled={colorPickerDisabled}
              />
            </InputGroup>
          </Modal.Body>
          <Modal.Footer
            // If a help string is being rendered, change flexbox justify
            className={customName.length > 0 && uniqueName ? undefined : "justify-content-between"}
          >
            {!customName.length && // If button is disabled, render help string
              <p style={{color: "var(--bs-warning)"}}>
                Character name cannot be empty.
              </p>
            }
            {!uniqueName &&  // If button is disabled, render help string
              <p style={{color: "var(--bs-warning)"}}>
                Character name must be unique.
              </p>
            }
            <div>
              <Button variant="primary" type="submit"
                // Disable if character name field is empty or not unique.
                disabled={!customName.length || !uniqueName}
              >
                Save
              </Button>
              <Button variant="primary"
                onClick={() => {
                  if (isNewChar)
                    handleDelete(index);
                  else
                    setModalVis(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }

  return(
    <div className="mb-4 d-flex" style={{"--table-color": charState.color} as React.CSSProperties}>
      <ConfigModal/>
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
      <div>
        <TableHeader title={<Col className="table-cell" xs={2}>{charState.name}<br/>{charState.ilvl} {charState.class}</Col>}/>
        <CharacterGoalTable
          goals={goals}
          charIndex={index}
          charName={charState.name}
          setGoal={setGoal}
          setGoals={setGoals}
          updateRosterGoals={updateRosterGoals}
          updateRosterRem={updateRosterRem}
        />
        <MatsTable
          charIndex={index}
          matsTotalRef={matsTotal}
          boundMats={char.boundMats}
          updateCharRem={() => sendCharRemSignal([])}
          updateRosterRem={updateRosterRem}
        />
        {goals.length > 1 && // Skip rendering if char has no goals set
          <RemTable
            goals={goals}
            matsTotalRef={matsTotal}
            boundMats={char.boundMats}
            charRemUpdateSignal={charRemUpdateSignal}
          />
        }
      </div>
    </div>
  );
}