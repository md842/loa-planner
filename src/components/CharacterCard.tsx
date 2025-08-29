import './CharacterCard.css';

import {type Character, type Goal, type Materials, initMaterials, loadRosterMats, saveChars, saveCharSettings} from '../components/Core';
import {type ChangeEvent, type JSX, type RefObject, useRef, useState} from 'react';

import gold from '../assets/gold.png';
import silver from '../assets/silver.png';
import t4_blue from '../assets/t4_blue.png';
import t4_blueSolar from '../assets/t4_bluesolar.png';
import t4_fusion from '../assets/t4_fusion.png';
import t4_leap from '../assets/t4_leap.png';
import t4_red from '../assets/t4_red.png';
import t4_redSolar from '../assets/t4_redsolar.png';
import t4_shard from '../assets/t4_shard.png';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

export function CharacterCard(char: Character): JSX.Element{
  const changed: RefObject<boolean> = useRef(false); // true: unsaved changes

  // Refs used in initRemTable()
  const goalsTotal: RefObject<Goal> = useRef({name: "Total", values: initMaterials()});
  const matsTotal: RefObject<Materials> = useRef(initMaterials());

  // Table state variables
  const [goalTable, setGoals] = useState(initGoalTable);
  const [matsTable, setMats] = useState(initMatsTable);
  const [remTable, setRem] = useState(initRemTable);

  // Load initial character info into state so SettingsModal can change them
  const [charState, setCharState] = useState({name: char.name, ilvl: char.ilvl, class: char.class, usesClassColor: char.usesClassColor, color: char.color});
  const [modalVis, setModalVis] = useState(false); // SettingsModal visibility

  // Set table color to the character's saved color
  document.documentElement.style.setProperty("--table-color", charState.color);

  function initGoalTable(): JSX.Element[]{
    let workingTable: JSX.Element[] = []; // Initialize table and goalsTotal
    goalsTotal.current = {name: "Total", values: initMaterials()};
    
    char.goals.forEach((goal: Goal, index: number) => {
      // Build a row for each goal and push it to the table
      workingTable.push(<tr key={index}>{goalRow({goal: goal, isTotal: false})}</tr>);
      // Accumulate each goal's individual values into goalsTotal
      for (let [key, value] of Object.entries(goal.values))
        goalsTotal.current.values[key] += value;
    });
    if (char.goals.length > 1) // Build total row
      workingTable.push(<tr className="bold" key="totalGoals">{goalRow({goal: goalsTotal.current, isTotal: true})}</tr>);
    
    return workingTable; // Return table to state initializer
  }

  function initMatsTable(): JSX.Element[]{
    let workingTable: JSX.Element[] = []; // Initialize table and matsTotal
    matsTotal.current = initMaterials();
    let rosterMats: Materials = loadRosterMats();

    // Accumulate total materials
    for (let [key, value] of Object.entries(rosterMats))
      matsTotal.current[key] = char.boundMats[key] + value;
    matsTotal.current["silver"] = rosterMats["silver"];

    // Build and push each owned materials row
    workingTable.push(<tr key="boundMats">{matsRow({mats: char.boundMats, name: "Bound"})}</tr>);
    workingTable.push(<tr key="rosterMats">{matsRow({mats: rosterMats, name: "Roster"})}</tr>);
    workingTable.push(<tr className="bold" key="totalMats">{matsRow({mats: matsTotal.current, name: "Total"})}</tr>);
    
    return workingTable; // Return table to state initializer
  }

  function initRemTable(): JSX.Element[][]{
    let remTable: JSX.Element[] = [], remBoundTable: JSX.Element[] = []; // Initialize tables

    char.goals.forEach((goal: Goal, index: number) => {
      // Build rows for each goal and push it to the tables
      remTable.push(<tr key={index}>{goalRow({goal: goal, isTotal: false, subtract: matsTotal.current})}</tr>);
      remBoundTable.push(<tr key={index}>{goalRow({goal: goal, isTotal: false, subtract: char.boundMats})}</tr>);
    });
    if (char.goals.length > 1){ // Build total rows
      remTable.push(<tr className="bold" key="totalGoals">{goalRow({goal: goalsTotal.current, isTotal: true, subtract: matsTotal.current})}</tr>);
      remBoundTable.push(<tr className="bold" key="totalGoals">{goalRow({goal: goalsTotal.current, isTotal: true, subtract: char.boundMats})}</tr>);
    }
    
    return [remTable, remBoundTable]; // Return table to state initializer
  }

  function addGoal(){
    if (char.goals.length == 10) // Limit goals to 10
      return;
    char.goals.push({name: "(Goal Name)", values: initMaterials()});
    setGoals(initGoalTable()); // Update the goal table
    setRem(initRemTable()); // Update remaining materials tables
    saveChars(); // Save updated character data directly (bypass saveChanges())
  }

  function removeGoal(){
    if (char.goals.length == 1) // Must have at least 1 goal
      return;
    char.goals.pop(); // Removes last goal
    setGoals(initGoalTable()); // Update the goal table
    setRem(initRemTable()); // Update remaining materials tables
    saveChars(); // Save updated character data directly (bypass saveChanges())
  }

  function handleGoalChange(e: ChangeEvent<HTMLInputElement>, key: string, goal: Goal){
    /* Sizes of these sections are dynamic, so row slicing is unreliable due to
       the asynchronous nature of state. Thus, re-initialization is used. */
    if (key == "name"){ // No input sanitization needed for name string
      goal.name = e.target.value; // Update char data
      setRem(initRemTable()); // Update remaining materials tables
      changed.current = true; // Character data will be saved on next focus out
    }
    else if (sanitizeInput(e, goal.values[key])){ // Checks valid numeric input
      goal.values[key] = Number(e.target.value); // Update char data
      setGoals(initGoalTable()); // Update goal table
      setRem(initRemTable()); // Update remaining materials tables
      changed.current = true; // Character data will be saved on next focus out
    } // Reject non-numeric input outside of name field (do nothing)
  }

  function handleBoundMatChange(e: ChangeEvent<HTMLInputElement>, key: string){
    if (sanitizeInput(e, char.boundMats[key])){ // Checks valid numeric input
      /* Size of this section is static, so only the total row needs updating,
         and re-initialization can be avoided for performance reasons. */
      matsTotal.current[key] += Number(e.target.value) - char.boundMats[key];
      char.boundMats[key] = Number(e.target.value); // Update char data
      
      // Replace existing total row in matsTable with newly generated total row
      let matsTotalRow = <tr className="bold" key="totalMats">{matsRow({mats: matsTotal.current, name: "Total"})}</tr>;
      setMats([...matsTable.slice(0, -1), matsTotalRow]); // Update mats table
      setRem(initRemTable); // Update remaining materials tables
      changed.current = true; // Character data will be saved on next focus out
    } // Reject non-numeric input (do nothing)
  }

  function saveChanges(){
    if (changed.current){ // Check for unsaved changes
      saveChars(); // Save updated character data
      changed.current = false; // Mark changes as committed
    }
  }

  function SettingsModal(){
    const [colorPickerDisabled, setColorPickerDisabled] = useState(charState.usesClassColor);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
      // Extract form information
      let target: HTMLFormElement = e.target as HTMLFormElement;
      let name: string = (target[0] as HTMLFormElement).value;
      let ilvl: string = (target[1] as HTMLFormElement).value;
      let charClass: string = (target[2] as HTMLFormElement).value;
      let usesClassColor: boolean = (target[3] as HTMLFormElement).checked;
      let color: string = (target[4] as HTMLFormElement).value;

      // TODO: Implement class colors

      // Update (re-render) character info in top left of table
      setCharState({name: name, ilvl: ilvl, class: charClass, usesClassColor: usesClassColor, color: color});
      // Save updated character data
      saveCharSettings(char.index, name, ilvl, charClass, usesClassColor, color);
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
              <Form.Select defaultValue={charState.class}> {/* TODO: Populate with all classes */}
                <option value="Aeromancer">Aeromancer</option>
                <option value="Glaivier">Glaivier</option>
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

  /**
   * Generate a table row for the "Goals" or "Remaining materials" sections.
   * @param  {Goal}           goal      The goal being used to generate the row.
   * @param  {boolean}        isTotal   If true, this row represents a section total.
   * @param  {Materials}      subtract  The materials to subtract from the goal.
   *                                    If defined, this row is in a "Remaining materials" section.
   * @return {JSX.Element[]}            The generated table row.
   */
  function goalRow(fnParams: {goal: Goal, isTotal: boolean, subtract?: Materials}): JSX.Element[]{
    let row: JSX.Element[] = []; // Initialize table row for this goal

    // Add goal name to the table row for this goal
    if (fnParams.isTotal || fnParams.subtract) // Read-only if total or "Remaining materials" row
      row.push(<td className="read-only" key="name"><input className="invis-input goal-name" value={fnParams.goal.name} disabled/></td>);
    else // Writeable if non-total "Goals" row
      row.push(<td className="writeable" key="name">
                 <input
                   className="invis-input goal-name"
                   defaultValue={fnParams.goal.name}
                   onBlur={saveChanges}
                   onChange={(e) => handleGoalChange(e, "name", fnParams.goal)}
                 />
               </td>
      );
    
    // Add calculated gold value to the table row for this goal
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value="Placeholder" disabled/></td>); // TODO: Calculate value using market data once implemented.

    // Build the rest of the table row for this goal by pushing values as <td>
    Object.entries(fnParams.goal.values).forEach(([key, value]) => {
      if (fnParams.subtract){ // Row is in the "Remaining materials" section
        value = Math.max(0, value - fnParams.subtract[key]) // Must be >= 0
        // Always read only. Ternary expression replaces NaN with "--"
        row.push(<td className="read-only" key={key}><input className="invis-input" value={Number.isNaN(value) ? "--" : value} disabled/></td>);
      }
      else{ // Row is in the "Goals" section.
        if (fnParams.isTotal) // If total row, disable the input
          row.push(<td className="read-only" key={key}><input className="invis-input" value={value} disabled/></td>);
        else // If goal row, specify change handler
          row.push(<td className="writeable" key={key}>
                     <input
                       className="invis-input"
                       defaultValue={value}
                       onBlur={saveChanges}
                       onChange={(e) => handleGoalChange(e, key, fnParams.goal)}
                     />
                   </td>
          );
      }
    });
    return row;
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
    row.push(<td className="read-only" key="goldValue"><input className="invis-input bold" value="Placeholder" disabled/></td>); // TODO: Calculate value using market data once implemented.

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
      <SettingsModal/> {/* Hidden until settings-btn onClick sets modalVis to true*/}
      <Table hover>
        <thead>
          <tr>
            <th>
              <Button className="settings-btn" variant="link" onClick={() => setModalVis(true)}>
                <i className="bi bi-gear-fill"/>
              </Button>
              <br/>
              {charState.name}
            </th>
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
          <tr className="bold">
            <td className="section-title goals" colSpan={1}>Goals</td>
            <td className="section-title goal-btns" colSpan={10}>
              <Button variant="primary" onClick={addGoal}>Add Goal</Button>
              <Button variant="primary" onClick={removeGoal}>Remove Goal</Button>
            </td>
          </tr>
          {goalTable}
          <tr className="bold"><td className="section-title" colSpan={11}>Owned materials</td></tr>
          {matsTable}
          <tr><th colSpan={11}>&nbsp;</th></tr>{/* Blank row as spacer */}
          <tr className="bold section-title"><td className="section-title" colSpan={11}>{"Remaining materials"}</td></tr>
          {remTable[0]}
          <tr className="bold section-title"><td className="section-title" colSpan={11}>{"Remaining bound materials"}</td></tr>
          {remTable[1]}
        </tbody>
      </Table>
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