import './RosterStorageCard.css';

import {type ReactNode, useEffect, useState} from 'react';

import {SortableList} from '../Sortable/SortableList';
import {SourceRow} from './tables/SourceRow';

import {type Materials, type Source, findSource} from '../core/types';
import {getPresetSources, getSources, saveSources, setRosterMat, setSourceData} from '../core/roster-storage-data';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

/** Props interface for RosterStorageCard. */
interface RosterStorageCardProps{
  configurable?: boolean; // If defined, this table's sources are configurable.
  title: string; // Displayed in the top-left corner of the table
  color: string; // The color used for this table
  image: string; // The image used for this table
  mat: keyof Materials; // The material associated with this table

  // If defined, this RosterStorageTable is a combo table (e.g., reds/blues)
  color2?: string; // The color used for the second material area of this table
  image2?: string; // The image used for the second material area of this table
  mat2?: keyof Materials; // The second material associated with this table

  // If defined, this RosterStorageTable synchronizes with an external table.
  syncMatIndex?: number; // Index of mat this table represents in the sync pair
}

/** Constructs the "Goals" section of the parent table. */
export function RosterStorageCard(props: RosterStorageCardProps): ReactNode{
  let {configurable, title, color, image, mat,
       color2, image2, mat2,
       syncMatIndex} = props; // Unpack props

  // Get const reference to preset sources for this table's material(s)
  const presetSources = getPresetSources(mat);

  const [modalVis, setModalVis] = useState(false); // SettingsModal visibility

  // Table state variable for materials sources
  const [changed, setChanged] = useState(false);
  const [sources, setSources] = useState(() => getSources(mat));
  const [table, updateTable] = useState([] as ReactNode[]);

  // Update signal handlers
  useEffect(() => {
    setSourceData(mat, sources); // Updates source data
    updateTable(initTable); // Re-renders table
  }, [sources]); // Runs on mount and when sources change

  useEffect(() => {
    if (changed){ // Uncommitted changes are present
      saveSources(mat); // Save roster storage data for specified mat
      setChanged(false); // Signal that changes were committed
    }
  }, [changed]); // Runs when changed changes, does nothing on mount due to initial state false

  function initTable(): ReactNode[]{ // Table state initializer function
    let table: ReactNode[] = []; // Initialize table
    
    for (let i = 0; i < sources.length; i++){ // Build row for each source
      table.push(
        <SourceRow key={sources[i].id}
          total={i == sources.length - 1} // Last source is total
          src={sources[i]}
          index={i}
          combo={mat2 ? true : false}
          // Parent component state setters
          setChanged={setChanged}
          setSource={setSource}
          // Synchronized table props
          syncRow={syncMatIndex != null && sources[i].id == "Daily Chest"}
          syncMatIndex={syncMatIndex}
        />
      );
    }
    return table;
  }

  /** Updates source srcIndex, source total, and rosterMats. */
  function setSource(srcIndex: number, matIndex: number, qty?: number, selected?: boolean, newUse?: number[]){
    // Deep copy target source and total source from state variable
    let src: Source = JSON.parse(JSON.stringify(sources[srcIndex]));
    let total: Source = JSON.parse(JSON.stringify(sources[sources.length - 1]));

    function updateSource(matIndex: number, newUse?: number[]): Source{
      if (qty != null) // If defined, update src.qty
        src.qty[matIndex] = qty;
      if (selected != null) // If defined, update src.use (not selection chest)
        src.sel![matIndex] = selected;
      if (newUse){ // If defined, update src.use (selection chest)
        src.use![0] = newUse[0];
        if (newUse.length == 2)
          src.use![1] = newUse[1];
      }
      total.amt[matIndex] -= src.amt[matIndex]; // Subtract old amount from total

      if (src.sel && !src.sel[matIndex]) // Source is inactive
        src.amt[matIndex] = 0; // Set amount to 0
      else{ // Source is active, calculate new src.amt and add to total.amt
        // If src.use is defined, start from src.use, else start from src.qty
        let amt: number = (src.use) ? src.use[matIndex] : src.qty[matIndex];
        if (src.div) // Apply floor divisor if present
          amt = Math.floor(amt / src.div);
        if (src.mult) // Apply multiplier if present
          amt *= src.mult[matIndex];
        src.amt[matIndex] = amt; // Update source amount
        total.amt[matIndex] += amt; // Add new amount to total
      }
      return src;
    }

    src = updateSource(matIndex, newUse);
    if (src.use && src.amt.length == 2) // src is a selection chest
      src = updateSource(matIndex ? 0 : 1);

    // Update sources state variable
    setSources([
      ...sources.slice(0, srcIndex), // Sources before specified index
      src,
      ...sources.slice(srcIndex + 1, -1), // Sources after specified index
      total
    ]);
    
    // Update roster storage data (which material is set depends on matIndex)
    setRosterMat(matIndex ? mat2! : mat, total.amt[matIndex]);
  }

  function SettingsModal(){
    if (!configurable) // Only render SettingsModal if table is configurable
      return;

    // State variables store uncommitted changes to sources
    const [temp, setTemp] = useState(initTemp);
    const [tempTotal, setTempTotal] = useState(initTempTotal);

    function initTemp(): Source[]{ // temp state initializer function
      // Deep copy sources excluding "Other" and "Total" from sources
      return JSON.parse(JSON.stringify(sources.slice(0, -2)));
    }

    function initTempTotal(): Source{ // tempTotal state initializer function
      // Deep copy source total from sources
      return JSON.parse(JSON.stringify(sources[sources.length - 1]));
    }

    function handleAdd(e: React.FormEvent<HTMLFormElement>){
      e.preventDefault(); // Prevents refreshing page on form submission
      console.log("handleAdd called:", e);

      // Extract form information
      let target: HTMLFormElement = e.target as HTMLFormElement;
      let preset: string = (target[0] as HTMLFormElement).value;
      let custom: boolean = (target[1] as HTMLFormElement).checked;
      //let custom_name: string = (target[2] as HTMLFormElement).value;

      if (custom){ // TODO: Add custom source
      }
      else{ // Add preset source
        let index: number = findSource(preset, presetSources);
        if (index != -1) // Preset was found
          setTemp([...temp, presetSources[index]]);
        else // Preset was not found (most likely all presets already in temp)
          console.log("Failed to add!");
      }
    }

    function handleDelete(index: number){
      // Deep copy source total from tempTotal
      let total: Source = JSON.parse(JSON.stringify(tempTotal));

      // Subtract deleted source's amounts from total amount
      total.amt[0] -= temp[index].amt[0];
      if (mat2)
        total.amt[1] -= temp[index].amt[1];

      // Slice out specified index from temp
      setTemp([...temp.slice(0, index), ...temp.slice(index + 1)]);
      setTempTotal(total); // Update tempTotal
    }

    function saveChanges(){
      console.log("saveChanges() called. temp sources:", temp);
      setSources([
        ...temp, // Uncommitted changes
        sources[sources.length - 2], // "Other"
        tempTotal // "Total"
      ]);
      setChanged(true); // Save roster storage data for this mat
      setModalVis(false); // Close modal
    }

    return(
      <Modal show={modalVis} centered>
        <Modal.Header>
          <Modal.Title>Configure Sources of {title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Drag and drop sources to reorder them, or click the trash button to delete them.</p>
          <SortableList
            items={temp}
            onChange={setTemp}
            renderItem={(item: Source, index: number) => (
              <SortableList.Item id={item.id}>
                {item.id}
                <div>
                  <SortableList.DeleteButton handleDelete={handleDelete} index={index}/>
                  <SortableList.DragHandle/>
                </div>
              </SortableList.Item>
            )}
          />

          <hr/>

          <Form onSubmit={(e) => handleAdd(e)}>
            <p>Add a new source using the form below.</p>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon3">Preset Sources</InputGroup.Text>
              <Form.Select defaultValue={sources[0].id}>
                { /* Populate sources dropdown with sourceOptions */
                presetSources.map((src: Source) => {
                  if (findSource(src.id, temp) == -1)
                    return(<option key={src.id} value={src.id}>{src.id}</option>);
                })}
              </Form.Select>
            </InputGroup>

            <Form.Check
              className="mb-3"
              type="checkbox"
              label="Add custom source"
              defaultChecked={false}
            />

            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon3">Name</InputGroup.Text>
              <Form.Control/>
            </InputGroup>

            <Button className="d-block mx-auto" variant="primary" type="submit">Add</Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={saveChanges}>Save</Button>
          <Button variant="primary" onClick={() => setModalVis(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return(
    <Col style={{"--table-color": color, "--mat2-color": color2} as React.CSSProperties}>
      <SettingsModal/> {/* Hidden until setModalVis(true) onClick*/}
      <Table hover>
        <thead>
          <tr>
            <th>{title}</th>
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
            <td className="configure goal-btns" colSpan={4}>
              {!mat2 &&
                <Button variant="primary" onClick={() => setModalVis(true)}>Configure Sources</Button>
              }
            </td>
            {mat2 &&
              <td className="mat2 configure goal-btns" colSpan={3}>
                <Button variant="primary" onClick={() => setModalVis(true)}>Configure Sources</Button>
              </td>
            }
          </tr>}
        </thead>
        <tbody>
          {table}
        </tbody>
      </Table>
    </Col>
  );
}