import './RosterStorageCard.css';

import {type ChangeEvent, type JSX, useEffect, useState} from 'react';

import {Cell} from './tables/Cell';

import {type Materials, type Source} from '../core/types';
import {sanitizeInput} from './tables/common';
import {getSources, setRosterMat, saveSources} from '../core/roster-storage-data';

import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

/** Props interface for RosterStorageCard. */
interface RosterStorageCardProps{
  configurable?: boolean; // If defined, this table is configurable.
  friendlyName: string; // Displayed as the table name (top-left corner)
  color: string; // The color used for this table
  image: string; // The image used for this table
  mat: keyof Materials; // The material associated with this table

  // If defined, this RosterStorageTable is a combo table (e.g., reds/blues)
  color2?: string; // The color used for the second material area of this table
  image2?: string; // The image used for the second material area of this table
  mat2?: keyof Materials; // The second material associated with this table

  // References to parent component state/state setters for synchronized tables
  /* If defined, this table is a controlled table; its daily chests field is
     controlled by another table's. setDailyChestQty must not be defined. */
  dailyChests?: number[];
  /* If defined, this table is a controlling table; its daily chests field
     controls another table's. dailyChests must not be defined. */
  setDailyChestQty?: (qty: number) => void;

  /* The following props must both be defined if either prop above is defined.
     Signal [true] if daily chests are selected in the controlling table,
            [false] if daily chests are selected in the controlled table. */
  dailyChestSel?: boolean[];
  setDailyChestSel?: (controllingTable: boolean) => void;
}

// If true, changes will be committed by saveRosterMats() on next onBlur event.
let changed: boolean = false;

/** Constructs the "Goals" section of the parent table. */
export function RosterStorageCard(props: RosterStorageCardProps): JSX.Element{
  let {configurable, friendlyName, color, image, mat, color2, image2, mat2,
       dailyChests, setDailyChestQty,
       dailyChestSel, setDailyChestSel} = props; // Unpack props

  // Get const references to sources for this table's material(s)
  const sources = getSources(mat);

  const [modalVis, setModalVis] = useState(false); // SettingsModal visibility

  // Table state variable for materials sources
  const [table, updateTable] = useState(initTable);

  // Daily chest synchronization signal handlers
  useEffect(() => { // Controlled table quantity update hook
    if (dailyChests && dailyChests.length){ // Received non-empty signal
      sources[0].qty = dailyChests; // Update source quantity to signal value
      updateAmts(sources[0], sources[sources.length - 1], 0, mat);
      saveSources(mat); // Save roster storage data for specified mat

      updateTable([
        <SourceRow key="Daily Chest" index={0}/>,
        ...table.slice(1, -1), // Sources after specified index
        <SourceRow total key="total" index={sources.length - 1}/>,
      ]); // Only re-renders the first row (daily chests) and the total row
    }
  }, [dailyChests]); // Runs when dailyChests changes, does nothing on mount due to empty signal

  useEffect(() => { // Controlling/controlled table selected update hook
    if (dailyChestSel && dailyChestSel.length){ // Received non-empty signal
      // Controlling table sets selected == signal, controlled table sets selected == !signal
      sources[0].selected![0] = (((setDailyChestQty) && dailyChestSel[0]) ||
                                 ((!setDailyChestQty) && !dailyChestSel[0]));
      updateAmts(sources[0], sources[sources.length - 1], 0, mat);
      saveSources(mat); // Save roster storage data for specified mat

      updateTable([
        <SourceRow key="Daily Chest" index={0}/>,
        ...table.slice(1, -1), // Sources after specified index
        <SourceRow total key="total" index={sources.length - 1}/>,
      ]); // Only re-renders the first row (daily chests) and the total row
    }
  }, [dailyChestSel]); // Runs when dailyChestSel changes, does nothing on mount due to empty signal

  function initTable(): JSX.Element[]{ // Table state initializer function
    let table: JSX.Element[] = []; // Initialize table
    
    for (let i = 0; i < sources.length - 1; i++) // Build row for each source
      table.push(<SourceRow key={sources[i].label} index={i}/>);

    // Build the total row and push it to the table
    table.push(<SourceRow total key="total" index={sources.length - 1}/>);
    return table;
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    let input: number = Number(e.target.value); // For readability
    let changedSrc: Source = sources[index];
    
    if (sanitizeInput(e, sources[index].qty[matIndex])){ // Valid numeric input
      changedSrc.qty[matIndex] = input; // Update source quantity
      updateAmts(changedSrc, sources[sources.length - 1], matIndex, mat, mat2);
      
      if (changedSrc.selectionChest){ // Changed source is a selection chest
        // Note: For selection chest, matIndex always 0, mat2 always defined
        changedSrc.qty[1] = input; // Update (synchronize) source quantity
        updateAmts(changedSrc, sources[sources.length - 1], 1, mat, mat2);
      }

      updateTable([
        ...table.slice(0, index), // Sources before specified index
        <SourceRow key={changedSrc.label} index={index}/>,
        ...table.slice(index + 1, -1), // Sources after specified index
        <SourceRow total key="total" index={sources.length - 1}/>,
      ]); // Only re-renders the row being updated and the total row

      /* Special case: daily chests (source index 0) synced between tables.
         Signal received by controlled table only, so send signal at end of
         handleChange of controlling table. */
      if (setDailyChestQty && index == 0)
        setDailyChestQty(changedSrc.qty[0]); // Sync quantity fields

      changed = true; // Roster storage data will be saved on next focus out
    } // Reject non-numeric input outside of name field (do nothing)
  }

  function handleChecked(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    /* Special case: daily chests (source index 0) synced between tables.
       Signal received by both tables, so override handleChecked by sending
       signal at the beginning and returning early. */
    if (setDailyChestSel && index == 0){
      // Controlling table sends true if checked, controlled table sends false if checked
      setDailyChestSel((setDailyChestQty) && e.target.checked || (!setDailyChestQty) && !e.target.checked);
      return; // Override handleChecked by returning early
    }
    let changedSrc: Source = sources[index]; // For readability

    /* Update changedSrc.selected (guaranteed to be defined in
       handleChecked, otherwise checkboxes would not render) */
    changedSrc.selected![matIndex] = e.target.checked;
    updateAmts(changedSrc, sources[sources.length - 1], matIndex, mat, mat2);

    // Changed source is combo selection chest, update source's other material
    if (changedSrc.selectionChest){
      let otherIndex: number = (matIndex == 0) ? 1 : 0
      // Set other material's "selected" field to opposite value
      changedSrc.selected![otherIndex] = !e.target.checked;
      updateAmts(changedSrc, sources[sources.length - 1], otherIndex, mat, mat2);
    }

    updateTable([
      ...table.slice(0, index), // Sources before specified index
      <SourceRow key={changedSrc.label} index={index}/>,
      ...table.slice(index + 1, -1), // Sources after specified index
      <SourceRow total key="total" index={sources.length - 1}/>,
    ]); // Only re-renders the row being updated and the total row

    saveSources(mat); // Save roster storage data for specified mat
  }

  /**
   * Generate a table row for the "Roster Storage" section.
   * @param  {boolean}        total     If true, this row represents the table total.
   * @param  {number}         index     The index of the source to use for this row.
   * @return {JSX.Element[]}            The generated table row.
   */
  function SourceRow(props: {total?: boolean, index: number}): JSX.Element{
    let {total, index} = props; // Unpack props
    let src: Source = sources[index]; // For readability
    let cells: JSX.Element[] = []; // Initialize table row for this source

    console.log(mat, "SourceRow", index, "rendering");

    cells.push(<Cell bold key="label" value={src.label}/>); // Source label

    cells.push( // Material 1 quantity field
      <Cell key="qty" value={total ? undefined : src.qty[0]} // Empty if total
        onBlur={(total || (dailyChests && index == 0)) ? undefined : () => {if (changed){saveSources(mat)}; changed = false}}
        onChange={(total || (dailyChests && index == 0)) ? undefined : (e) => handleChange(e, index, 0)}
      /> // Input disabled if total or daily chests of controlled table
    );
    
    cells.push( // Material 1 selected field
      <td className="read-only" key="sel">
        {src.selected && // Render checkbox conditionally
          <Form.Check className="mat1-checkbox"
            type="checkbox"
            // If selection chest, checked = inverse of other checkbox
            defaultChecked={src.selectionChest ? undefined : src.selected[0]}
            checked={src.selectionChest ? !src.selected[1] : undefined}
            onChange={(e) => handleChecked(e, index, 0)}
          />}
      </td>);

    // Material 1 amount field
    cells.push(<Cell bold key="amt" value={src.amt[0]}/>);

    if (mat2){ // If combo table, push cells for second material
      cells.push( // Material 2 quantity field
        <Cell key="qty2" className="mat2" value={(total) ? undefined : src.qty[1]} // Empty if total
          onBlur={total ? undefined : () => {if (changed){saveSources(mat)}; changed = false}}
          onChange={(total || src.selectionChest) ? undefined : (e) => handleChange(e, index, 1)}
        /> // Input disabled if total or selection chest (use material 1 field)
      );
      
      cells.push( // Material 2 selected field
        <td key="sel2" className="read-only mat2">
          {src.selected && // Render checkbox conditionally
            <Form.Check className="mat2-checkbox"
              type="checkbox"
              // If selection chest, checked = inverse of other checkbox
              defaultChecked={src.selectionChest ? undefined : src.selected[1]}
              checked={src.selectionChest ? !src.selected[0] : undefined}
              onChange={(e) => handleChecked(e, index, 1)}
            />}
        </td>);

      // Material 2 amount field
      cells.push(<Cell bold key="amt2" className="mat2" value={src.amt[1]}/>);
    }
    return <tr>{cells}</tr>;
  }

  function SettingsModal(){
    const sourceOptions: Source[] = sources;

    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
      console.log("Event:", e);
      setModalVis(false); // Close modal
    }

    return(
      <Modal show={modalVis} centered>
        <Modal.Header>
          <Modal.Title>Configure {friendlyName} Sources</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => handleSubmit(e)}>
            <Accordion className="mb-3" defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Configure Existing Sources</Accordion.Header>
                <Accordion.Body>
                  { /* Populate sources dropdown with sourceOptions */
                  sourceOptions.map((src: Source) => {
                    return(<p key={src.label}>{src.label}</p>);
                  })}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Add Preset Source</Accordion.Header>
                <Accordion.Body>
                  <InputGroup className="mb-3">
                    <Form.Select defaultValue={sources[0].label}>
                      { /* Populate sources dropdown with sourceOptions */
                      sourceOptions.map((src: Source) => {
                        return(<option key={src.label} value={src.label}>{src.label}</option>);
                      })}
                    </Form.Select>
                    <Button variant="primary">Add</Button>
                  </InputGroup>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>Add Custom Source</Accordion.Header>
                <Accordion.Body>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">Name</InputGroup.Text>
                    <Form.Control/>
                  </InputGroup>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <Button variant="primary" onClick={() => setModalVis(false)}>Close</Button>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  return(
    <Col style={{"--table-color": color, "--mat2-color": color2} as React.CSSProperties}>
      <SettingsModal/> {/* Hidden until setModalVis(true) onClick*/}
      <Table hover>
        <thead>
          <tr>
            <th>{friendlyName}</th>
            <th><img src={image}/></th>
            <th>Use?</th>
            <th>Amount</th>
            {mat2 && <>
              <th className="mat2"><img src={image2}/></th>
              <th className="mat2">Use?</th>
              <th className="mat2">Amount</th>
            </>}
          </tr>
          {configurable && <tr>
            <td className="section-title goal-btns" colSpan={(mat2) ? 7 : 4}>
              <Button variant="primary" onClick={() => setModalVis(true)}>Configure Sources</Button>
            </td>
          </tr>}
        </thead>
        <tbody>
          {table}
        </tbody>
      </Table>
    </Col>
  );
}


/** Update source amount, total amount, and rosterMats according to src. */
function updateAmts(src: Source, total: Source, matIndex: number, mat: keyof Materials, mat2?: keyof Materials){
  total.amt[matIndex] -= src.amt[matIndex]; // Subtract old amount from total

  if (src.selected && !src.selected[matIndex]) // Source is inactive
    src.amt[matIndex] = 0; // Set amount to 0
  else{ // Source is active, calculate new src.amt and add to total.amt
    let amt: number = src.qty[matIndex]; // Start from source quantity
    if (src.div) // Apply floor divisor if present
      amt = Math.floor(amt / src.div);
    if (src.mult) // Apply multiplier if present
      amt *= src.mult[matIndex];
    src.amt[matIndex] = amt; // Update source amount
    total.amt[matIndex] += amt; // Add new amount to total
  }

  // Update roster storage data (which material is set depends on matIndex)
  setRosterMat(matIndex ? mat2! : mat, total.amt[matIndex]);
}