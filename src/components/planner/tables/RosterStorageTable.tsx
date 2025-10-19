import './RosterStorageTable.css';

import {type ChangeEvent, type ReactNode, useContext, useEffect, useState} from 'react';

import {SortableList} from '../../Sortable/SortableList';
import {SourceRow} from '../table-components/SourceRow';

import {PlannerSyncContext} from '../../../pages/Planner';
import {type Materials, type Source, findSource} from '../../core/types';
import {getPresetSources, getSources, saveSources, setRosterMat, setSourceData} from '../../core/roster-storage-data';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';

/** Props interface for RosterStorageTable. */
interface RosterStorageTableProps{
  configurable?: boolean; // If defined, this table's sources are configurable.
  title: string; // Displayed in the top-left corner of the table
  color: string; // The color used for this table
  image: string; // The image used for this table
  mat: keyof Materials; // The material associated with this table

  // If defined, the parameters below this one should not be defined.
  wideQty?: boolean; // If true, render a wider quantity field.

  // If defined, this RosterStorageTable is a combo table (e.g., reds/blues)
  title2?: string; // Displayed in the top-left corner of second material area of this table
  color2?: string; // The color used for the second material area of this table
  image2?: string; // The image used for the second material area of this table
  mat2?: keyof Materials; // The second material associated with this table

  // If defined, this RosterStorageTable synchronizes with an external table.
  syncMatIndex?: number; // Index of mat this table represents in the sync pair
}

/** Constructs the "Goals" section of the parent table. */
export function RosterStorageTable(props: RosterStorageTableProps): ReactNode{
  let {configurable, title, color, image, mat, wideQty,
       title2, color2, image2, mat2,
       syncMatIndex} = props; // Unpack props

  // Get const reference to preset sources for this table's material(s)
  const presetSources = getPresetSources(mat);

  const [modalVis, setModalVis] = useState(false); // ConfigModal visibility

  // Table state variable for materials sources
  const [changed, setChanged] = useState(false);
  const [sources, setSources] = useState(() => getSources(mat));
  const [table, updateTable] = useState([] as ReactNode[]);

  // Signals used to sync with other child components of Planner
  const syncCtx = useContext(PlannerSyncContext);

  // Update signal handlers
  useEffect(() => { // Signaled by SourceRow (onBlur)
    if (changed){ // Uncommitted changes are present
      saveSources(mat); // Save roster storage data for specified mat
      setChanged(false); // Signal that changes were committed
      syncCtx.setRosterMatsChanged(true); // Send signal to RosterView
    }
  }, [changed]); // Does nothing on mount due to initial state false

  useEffect(() => { // Signaled by SourceRow (onChange)
    setSourceData(mat, sources); // Updates source data
    updateTable(initTable); // Re-renders table
  }, [sources]); // Runs on mount and when sources change

  function initTable(): ReactNode[]{ // Table state initializer function
    let table: ReactNode[] = []; // Initialize table
    
    for (let i = 0; i < sources.length; i++){ // Build row for each source
      table.push(
        <SourceRow key={sources[i].id}
          total={i == sources.length - 1} // Last source is total
          src={sources[i]}
          index={i}
          wideQty={wideQty}
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
      if (selected != null) // If defined, update src.sel (not selection chest)
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

  function ConfigModal(){
    if (!configurable) // Only render ConfigModal if table is configurable
      return;

    // State variables for storing uncommitted changes to sources
    const [temp, setTemp] = useState(initTemp);
    const [tempTotal, setTempTotal] = useState(initTempTotal);

    // State variables for "Add Source" form
    // Controlled by radio buttons; decides which form is displayed
    const [preset, setPreset] = useState(true);
    // Allows disabling "Add Source" button for preset source when none left
    let presetsRemaining: boolean = false;
    // Allows disabling "Add Source" button for custom source when name is empty or not unique
    const [customName, setCustomName] = useState("");
    const [uniqueName, setUniqueName] = useState(true);

    function initTemp(): Source[]{ // temp state initializer function
      // Deep copy sources excluding "Other" and "Total" from sources
      return JSON.parse(JSON.stringify(sources.slice(0, -2)));
    }

    function initTempTotal(): Source{ // tempTotal state initializer function
      // Deep copy source total from sources
      return JSON.parse(JSON.stringify(sources[sources.length - 1]));
    }

    /** Called when clicking the trash button in the sortable list section. */
    function handleDelete(index: number){
      // Deep copy source total from tempTotal
      let total: Source = JSON.parse(JSON.stringify(tempTotal));

      // Subtract deleted source's amounts from total amount
      total.amt[0] -= temp[index].amt[0];
      if (mat2) // Combo source: subtract both amounts
        total.amt[1] -= temp[index].amt[1];

      /* If the current input in the custom source name field matches the name
         of the deleted source temp[index], and the deleted source name does
         not match a preset source, free the custom source name for re-use. */
      if (customName == temp[index].id)
        setUniqueName(findSource(customName, presetSources) == -1);

      // Delete the specified source by slicing out specified index from temp
      setTemp([...temp.slice(0, index), ...temp.slice(index + 1)]);
      setTempTotal(total); // Update tempTotal with newly computed total.amt
    }

    /** Called when clicking "Add Source" in the new source section. */
    function handleAddSource(e: React.FormEvent<HTMLFormElement>){
      e.preventDefault(); // Prevents refreshing page on form submission
      let target: HTMLFormElement = e.target as HTMLFormElement;

      if (preset){ // Add preset source
        // Extract form information
        let selection: string = (target[0] as HTMLFormElement).value;

        // Find index of selected preset source
        let index: number = findSource(selection, presetSources);
        setTemp([...temp, presetSources[index]]); // Append preset to temp
      }
      else{ // Add custom source
        // Extract form information
        let custom_id: string = (target[0] as HTMLFormElement).value;
        let sel: boolean = (target[1] as HTMLFormElement).checked;
        let mult: number = Number((target[2] as HTMLFormElement).value);
        let mult2: number | undefined = mat2 ? Number((target[3] as HTMLFormElement).value) : undefined;
        let div: number = Number((target[mat2 ? 4 : 3] as HTMLFormElement).value);

        let newSource: Source = { // Set required props
          id: custom_id,
          qty: mat2 ? [0, 0] : [0],
          amt: mat2 ? [0, 0] : [0],
        }

        // Set optional props
        if (sel){ // Checkbox has different meaning for single vs. combo source
          if (mat2) // Combo source: source is a selection chest
            newSource.use = [0, 0];
          else // Single source: source is selectable
            newSource.sel = [true];
        }

        // If either multiplier is not 1, set mult
        if ((mult != 1) || (mult2 != undefined && mult2 != 1)){
          if (mat2) // Combo source: set both multipliers
            newSource.mult = [mult, mult2!];
          else // Single source: set single multiplier
            newSource.mult = [mult];
        }

        if (div != 1) // If floor divisor is not 1, set div
          newSource.div = div; // Always single value

        setTemp([...temp, newSource]); // Append newSource to temp
        setUniqueName(false); // customName is no longer unique
      }
    }

    /** Handles the controlled name input in the new source section. */
    function handleCustomSourceNameChange(e: ChangeEvent<HTMLInputElement>){
      if (e.target.value.length < 30){ // Under length limit, accept input
        setCustomName(e.target.value); // Update controlled name input
        // Search for name in temp and presetSources; false if found in either
        setUniqueName((findSource(e.target.value, temp)) == -1 &&
                      (findSource(e.target.value, presetSources) == -1));
      }
    }

    /** Called when clicking "Save" in the modal footer. */
    function saveChanges(){
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
          <p>Add a new source using the form below.</p>
          <div className="d-flex justify-content-between px-5 mb-3">
            <Form.Check
              type="radio"
              label="Preset source"
              checked={preset}
              onChange={() => setPreset(true)}
            />
            <Form.Check
              type="radio"
              label="Custom source"
              checked={!preset}
              onChange={() => setPreset(false)}
            />
          </div>

          <Form onSubmit={(e) => handleAddSource(e)}>
            {preset && // Render preset sources dropdown
              <>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon3">Preset Sources</InputGroup.Text>
                  <Form.Select>
                    { /* Populate sources dropdown with sourceOptions */
                    presetSources.map((src: Source) => {
                      if (findSource(src.id, temp) == -1){ // Not found in temp
                        presetsRemaining = true;
                        return(<option key={src.id} value={src.id}>{src.id}</option>);
                      }
                    })}
                  </Form.Select>
                </InputGroup>
                {!presetsRemaining && // If button is disabled, render help string
                  <p style={{color: "var(--bs-warning)"}}>
                    All preset sources are already active, nothing to add.
                  </p>
                }
              </>
            }
            {!preset && // Render custom sources form
              <>
                <p>Tip: Hover over any input for an explanation.</p>
                <InputGroup className="mb-3" // Name field
                  title={"The source name, displayed in the first column."}
                >
                  <InputGroup.Text id="basic-addon3">Name</InputGroup.Text>
                  <Form.Control
                    value={customName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomSourceNameChange(e)}
                  />
                </InputGroup>

                <Form.Check // Selectable/selection chest toggle
                  title={mat2 ? "Selection chest sources allow opening a "
                  + "variable number of chests for each material (e.g., out "
                  + "of 375 Honing Support Selection Chests, 200 will be "
                  + "opened with Lava's Breath selected and 175 will be "
                  + "opened with Glacier's Breath selected)."
                  : "Selectable sources allow toggling whether or not the "
                  + "source is included in the total amount via checkbox."
                  + "\n\nUseful for quickly enabling and disabling tradable "
                  + "materials depending on whether or not they will be used "
                  + "for honing (enabled) or sold (disabled)."}
                  className="mb-3"
                  type="checkbox"
                  label={"Source is " + (mat2 ? "a selection chest" : "selectable")}
                />

                <div className="d-flex" // Multiplier input(s)
                  title={"Multiplier refers to the amount of materials per "
                  + "source quantity (e.g., Destiny Shard Pouch (S) has "
                  + "multiplier 1000 because one pouch contains 1000 Destiny "
                  + "Shards)."
                  + (mat2 ? "\n\nCombo sources may have a different "
                          + "multiplier for each quantity (e.g., Honing "
                          + "Support Selection Chest has multiplier 3 for "
                          + "Lava's Breath and 9 for Glacier's Breath)"
                          : "")}
                >
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">Multiplier</InputGroup.Text>
                    <Form.Control type="number" defaultValue={1} min={1}/>
                  </InputGroup>
                  {mat2 && // Render second multiplier input if combo source
                    <>
                      <div className="mx-1"/>{/* Spacing */}
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon3">Multiplier 2</InputGroup.Text>
                        <Form.Control type="number" defaultValue={1} min={1}/>
                      </InputGroup>
                    </>
                  }
                </div>

                <InputGroup className="mb-3"
                  title={"Tip: Floor divisor is usually 1."
                  + "\n\nFloor divisor performs a floor division on the "
                  + "quantity before applying the multiplier (if present)."
                  + "\n\nUseful when an exchange is involved (e.g., "
                  + "converting 1580 Leapstones to 1640 has floor divisor 5 "
                  + "mirroring the 5:1 exchange ratio, converting Blue "
                  + "Crystals to Abidos Fusion Materials has floor divisor 65 "
                  + "and multiplier 50 mirroring the 65:50 exchange ratio)."}
                >
                  <InputGroup.Text id="basic-addon3">Floor divisor</InputGroup.Text>
                  <Form.Control type="number" defaultValue={1} min={1}/>
                </InputGroup>

                {!customName.length &&  // If button is disabled, render help string
                  <p style={{color: "var(--bs-warning)"}}>
                    Custom source name cannot be empty.
                  </p>
                }
                {!uniqueName &&  // If button is disabled, render help string
                  <p style={{color: "var(--bs-warning)"}}>
                    Custom source name must be unique.
                  </p>
                }
              </>
            }
            <Button className="d-block mx-auto" variant="primary" type="submit"
              /* Disable if preset source selected but no presets to add,
                 or custom source selected but name is empty or not unique. */
              disabled={preset && !presetsRemaining ||
                        !preset && (!customName.length || !uniqueName)}
            >
              Add Source
            </Button>
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
    <>
      <ConfigModal/> {/* Hidden until setModalVis(true) onClick*/}
      <Container className="container-table mb-3" style={{"--table-color": color, "--mat2-color": color2} as React.CSSProperties}>
        <Row className="table-head">
          <Col className="table-cell" xs={wideQty ? 4 : (mat2 ? 3 : 6)}>
            <div className="d-flex align-items-end">
              <img src={image}/>
              <p className="mx-2 mb-0">{title}</p>
            </div>
          </Col>
          <Col className="table-cell" xs={wideQty ? 3 : (mat2 ? 1 : 2)}>Quantity</Col>
          <Col className="table-cell" xs={mat2 ? 1 : 2}>Use?</Col>
          <Col className="table-cell" xs={wideQty ? 3 : (mat2 ? 1 : 2)}>Amount</Col>
          {mat2 && <>
            <Col className="mat2 table-cell" xs={3}>
              <div className="d-flex align-items-end">
                <img src={image2}/>
                <p className="mx-2 mb-0">{title2}</p>
              </div>
            </Col>
            <Col className="mat2 table-cell">Quantity</Col>
            <Col className="mat2 table-cell">Use?</Col>
            <Col className="mat2 table-cell">Amount</Col>
          </>}
        </Row>
        {configurable && <Row>
          <Col className="section-title justify-content-end" xs={mat2 ? 6 : 12}>
            {!mat2 &&
              <Button variant="primary" onClick={() => setModalVis(true)}>Configure Sources</Button>
            }
          </Col>
          {mat2 &&
            <Col className="mat2 section-title justify-content-end" xs={6}>
              <Button variant="primary" onClick={() => setModalVis(true)}>Configure Sources</Button>
            </Col>
          }
        </Row>}
        {table}
      </Container>
    </>
  );
}