import {type ChangeEvent, type ReactNode, useContext, useEffect, useState} from 'react';

import {arrayMove} from "@dnd-kit/sortable";
import {GoalRow} from '../table-components/GoalRow';
import {SortableList} from '../../Sortable/SortableList';

import {PlannerSyncContext} from '../../../pages/Planner';
import {type Goal, initGoal, goalNameUnique, type RosterGoal, initRosterGoal, type Character} from '../../core/types';
import {getRosterGoals, saveRosterGoals, setRosterGoalData} from '../../core/character-data';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';

/** Props interface for RosterGoalTable. */
interface RosterGoalTableProps{
  goals: Goal[]; // The table goals calculated by RosterCard for the roster goal data
  remGoals: Goal[];  // The table goals for the associated RosterCard RemTable
  chars: Character[]; // The characters in the roster

  // References to parent component state/state setters
  // Wrapper for updating the target goal in parent component state
  setGoal(goalIndex: number, id: string): void;
  // Directly updates parent component goal state (used by SettingsModal)
  setGoals(goals: Goal[]): void;
  setRemGoals(goals: Goal[]): void;
  updateRosterGoals: () => void; // Send signal to update RosterCard GoalTable
  updateRosterRem: () => void; // Send signal to update RosterCard RemTable
}

/** Constructs the "Goals" section of RosterCard. */
export function RosterGoalTable(props: RosterGoalTableProps): ReactNode{
  let {goals, remGoals, chars,
       setGoal, setGoals, setRemGoals,
       updateRosterGoals, updateRosterRem} = props; // Unpack props

  const [modalVis, setModalVis] = useState(false); // ConfigModal visibility

  // Table state variables for roster goals.
  const [changed, setChanged] = useState(false);
  // Will be initialized when useEffect runs on mount, so initialize blank
  const [table, updateTable] = useState([] as ReactNode[]);

  const plannerSyncContext = useContext(PlannerSyncContext);

  // Update signal handlers
  useEffect(() => {
    console.log("RosterGoalTable got change in marketData");
    updateTable(initTable); // Re-renders table
  }, [plannerSyncContext.marketDataChanged]); // Runs on mount and when marketData changes

  useEffect(() => {
    updateTable(initTable); // Re-render goals table
  }, [goals]); // Runs on mount and when table goals change

  useEffect(() => {
    if (changed){ // Uncommitted changes are present
      saveRosterGoals(); // Save updated roster goal data
      setChanged(false); // Signal that changes were committed
    }
  }, [changed]); // Runs when changed changes, does nothing on mount due to initial state false
  
  
  function initTable(): ReactNode[]{ // Table state initializer function
    let table: ReactNode[] = []; // Initialize table
        
    for (let i = 0; i < goals.length; i++){ // Build row for each goal
      table.push(
        <GoalRow roster key={i}
          goal={goals[i]}
          index={i}
          /* GoalRow only receives its own goal data, so pass a version of
            goalNameUnique that captures goals from parent table props. */
          goalNameUnique={(name: string, ignoreIndex: number) => goalNameUnique(goals, name, ignoreIndex)}
          // Parent component state setters
          setChanged={setChanged}
          setGoal={setGoal}
        />
      );
    }
    return table;
  }

  function ConfigModal(){
    // State variables for storing uncommitted changes to roster goals
    const [tempTableGoals, setTempTableGoals] = useState(initTempTableGoals);
    const [tempRemTableGoals, setTempRemTableGoals] = useState(initTempRemTableGoals);
    const [tempRosterGoals, setTempRosterGoals] = useState(initTempRosterGoals);

    // State variables for editing roster goals
    const [editIndex, setEditIndex] = useState(0);
    /* Reordering, adding, or deleting roster goals does not require table goal
       recalculation (expensive). Set if roster goal contents are modified. */
    const [recalculateTableGoals, setRecalculate] = useState(false);

    /* State variables for "Add Goal" form; allows disabling "Add Goal" button
       when name is empty or not unique */
    const [goalName, setGoalName] = useState("");
    const [uniqueName, setUniqueName] = useState(true);

    function initTempTableGoals(): Goal[]{ // temp state initializer function
      // Deep copy table goals
      return JSON.parse(JSON.stringify(goals));
    }

    function initTempRemTableGoals(): Goal[]{ // temp state initializer function
      // Deep copy RemTable goals
      return JSON.parse(JSON.stringify(remGoals));
    }

    function initTempRosterGoals(): RosterGoal[]{ // tempRosterGoals state initializer function
      // Deep copy roster goals
      return JSON.parse(JSON.stringify(getRosterGoals()));
    }

    /** Called when clicking the trash button in the sortable list section. */
    function handleDelete(index: number){
      /* If the current input in the goal name field matches the name of the
         deleted goal tempRosterGoals[index], free the goal name for re-use. */
      if (goalName == tempRosterGoals[index].id)
        setUniqueName(true);

      // Delete the specified roster goal by slicing out specified index from temp
      setTempRosterGoals([...tempRosterGoals.slice(0, index), ...tempRosterGoals.slice(index + 1)]);

      if (!recalculateTableGoals){ // If roster goal contents are not modified,
        // Reflect the same deletion in table goals and RemTable goals.
        setTempTableGoals([...tempTableGoals.slice(0, index), ...tempTableGoals.slice(index + 1)]);
        setTempRemTableGoals([...tempRemTableGoals.slice(0, index), ...tempRemTableGoals.slice(index + 1)]);
      }
    }

    /** Called when clicking the edit button in the sortable list section. */
    function handleEdit(index: number){
      setEditIndex(index); // Sets index of goal whose edit button was clicked
    }

    /** Called when swapping items in the sortable list section. */
    function handleSwap(activeIndex: number, overIndex: number){
      /* If the swapped goal is currently selected for editing, set editIndex
         to overIndex so that the same goal is selected after swapping. */
      if (activeIndex == editIndex)
        setEditIndex(overIndex);

      if (!recalculateTableGoals){ // If roster goal contents are not modified,
        // Reflect the same swap in table goals and RemTable goals.
        setTempTableGoals(arrayMove(tempTableGoals, activeIndex, overIndex));
        setTempRemTableGoals(arrayMove(tempRemTableGoals, activeIndex, overIndex));
      }
    }

    /** Renders goal checkboxes in the goal editing section. */
    function GoalCheckboxes(props: {goals: Goal[], charIndex: number}): ReactNode{
      /* Separating checkbox rendering into its own component function allows
         defaultChecked to update when changing selected roster goal. */

      function handleChecked(e: ChangeEvent<HTMLInputElement>, charIndex: number, goalIndex: number){
        // Deep copy selected roster goal from tempRosterGoals
        let tempRosterGoal: RosterGoal = JSON.parse(JSON.stringify(tempRosterGoals[editIndex]));
        tempRosterGoal.goals[charIndex][goalIndex] = e.target.checked;

        // Table goals must be recalculated if roster goals were modified.
        setRecalculate(true);

        setTempRosterGoals([ // Update temp state variable
          ...tempRosterGoals.slice(0, editIndex), // Roster goals before editIndex
          tempRosterGoal, // Edited roster goal
          ...tempRosterGoals.slice(editIndex + 1) // Roster goals after editIndex
        ]);
      }

      return(
        <>
          {chars[props.charIndex].goals.length == 1 &&
            <p>(No goals set)</p>
          }
          {props.goals.map((goal: Goal, goalIndex: number) => {
            // Render a checkbox for each character goal except "Total"
            if (goalIndex < chars[props.charIndex].goals.length - 1)
              return(<Form.Check
                className="mb-3"
                style={{overflowWrap: "anywhere"} /* Long names wrap to new line */}
                key={goal.id + goalIndex}
                type="checkbox"
                label={goal.id}
                defaultChecked={tempRosterGoals[editIndex].goals[props.charIndex][goalIndex]}
                onChange={(e) => handleChecked(e, props.charIndex, goalIndex)}
              />);
          })}
        </>
      );
    }

    /** Called when clicking "Add Goal" in the new goal section. */
    function handleAddGoal(e: React.FormEvent<HTMLFormElement>){
      e.preventDefault(); // Prevents refreshing page on form submission

      // Update temp state variable with new roster goal
      setTempRosterGoals([...tempRosterGoals, initRosterGoal(goalName, chars)]);
      setUniqueName(false); // goalName is no longer unique

      if (!recalculateTableGoals){ // If roster goal contents are not modified,
        // Reflect the same addition in table goals and RemTable goals.
        setTempTableGoals([...tempTableGoals, initGoal(goalName)]);
        setTempRemTableGoals([...tempRemTableGoals, initGoal(goalName)]);
      }
    }

    /** Handles the controlled name input in the new goal section. */
    function handleAddGoalNameChange(e: ChangeEvent<HTMLInputElement>){
      if (e.target.value.length < 30){ // Under length limit, accept input
        setGoalName(e.target.value); // Update controlled name input
        // Search tempGoals for matching name and set uniqueName accordingly
        setUniqueName(goalNameUnique(tempRosterGoals, e.target.value, undefined));
      }
    }

    /** Called when clicking "Save" in the modal footer. */
    function saveChanges(){
      setRosterGoalData(tempRosterGoals); // Apply uncommitted changes

      if (recalculateTableGoals){ // If roster goal contents were modified
        // Table goals must be recalculated in RosterCard
        updateRosterGoals(); // Send signal to update RosterCard GoalTable
        updateRosterRem(); // Send signal to update RosterCard RemTable
      }
      else{ // If roster goal contents were not modified
        // Skip recalculation by manipulating existing table goals
        setGoals(tempTableGoals);
        setRemGoals(tempRemTableGoals);
      }
      setModalVis(false); // Close modal
    }

    return(
      <Modal size="lg" show={modalVis} centered>
        <Modal.Header>
          <Modal.Title>Configure Roster Goals</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Drag and drop roster goals to reorder them, click the trash button
             to delete them, or click the edit button to select which character
             goals they include.</p>
          {tempRosterGoals.length > 0 && // If roster goals are present
            <>
              <SortableList
                items={tempRosterGoals}
                onChange={setTempRosterGoals}
                renderItem={(item: RosterGoal, index: number) => (
                  <SortableList.Item id={item.id}>
                    {item.id}
                    <div>
                      <SortableList.DeleteButton handleDelete={handleDelete} index={index}/>
                      <SortableList.EditButton handleEdit={handleEdit} index={index}/>
                      <SortableList.DragHandle/>
                    </div>
                  </SortableList.Item>
                )}
                moveHandler={handleSwap}
              />
              <hr/>
              <p className="mb-3">Select character goals to include in roster goal: <b>{tempRosterGoals[editIndex].id}</b></p>
              <div className="d-flex flex-wrap">
                { /* Populate with character names and corresponding goals */
                chars.map((char: Character, charIndex: number) => {
                  return(<div className="mb-3 w-25" key={char.name + charIndex}>
                    <h6 className="mb-3">{char.name}</h6>
                    <GoalCheckboxes goals={char.goals} charIndex={charIndex}/>
                  </div>);
                })}
                {!chars.length && // Render help string if no characters
                  <p className="text-center">No characters found, please add some using the "Add Character" button on the main page.</p>
                }
              </div>
            </>
          }
          {!tempRosterGoals.length && // Render help string if no roster goals
            <p className="text-center">No roster goals set, please add one using the form below.</p>
          }
          <hr/>

          <p>Add a new roster goal using the form below.</p>
          <Form onSubmit={(e) => handleAddGoal(e)}>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon3">Name</InputGroup.Text>
              <Form.Control
                value={goalName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAddGoalNameChange(e)}
              />
            <Button className="d-block mx-auto" variant="primary" type="submit"
              // Disable if goal name is empty or not unique
              disabled={!goalName.length || !uniqueName}
            >
              Add Roster Goal
            </Button>
            </InputGroup>
            {!goalName.length &&  // If button is disabled, render help string
              <p style={{color: "var(--bs-warning)"}}>
                Goal name cannot be empty.
              </p>
            }
            {!uniqueName &&  // If button is disabled, render help string
              <p style={{color: "var(--bs-warning)"}}>
                Goal name must be unique.
              </p>
            }
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
      <Container className="container-table m-0">
        <Row className="table-head">
          <Col
            className="bold section-title d-flex justify-content-between"
            xs={12}
          >
            Goals
            <Button variant="primary" onClick={() => setModalVis(true)}>Configure Roster Goals</Button>
          </Col>
        </Row>
        {table}
      </Container>
    </>
  );
}