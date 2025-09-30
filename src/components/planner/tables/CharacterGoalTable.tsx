import {type ReactNode, useEffect, useState} from 'react';

import {arrayMove} from "@dnd-kit/sortable";
import {GoalRow} from './GoalRow';
import {SortableList} from '../../Sortable/SortableList';

import {type Goal, initGoal, type Materials, subMaterials, type RosterGoal} from '../../core/types';
import {getRosterGoals, saveChars, setGoalData, setRosterGoals} from '../../core/character-data';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

/** Props interface for GoalTable. */
interface GoalTableProps{
  goals: Goal[]; // The character goals for this GoalTable
  charIndex: number; // The index of the character this GoalTable is for.
  charName: string; // The name of the character this GoalTable is for.

  // References to parent component state/state setters
  // Wrapper for updating the target and total goal in parent component state
  setGoal(goalIndex: number, id?: string, key?: keyof Materials, value?: number): void;
  // Directly updates parent component goal state (used by SettingsModal)
  setGoals(goals: Goal[]): void;
  updateRosterGoals(): void; // Sends signal to update RosterCard GoalTable
  updateRosterRem(): void; // Sends signal to update RosterCard RemTable
}

/** Constructs the "Goals" section of the parent table. */
export function CharacterGoalTable(props: GoalTableProps): ReactNode{
  let {goals, charIndex, charName,
       setGoal, setGoals,
       updateRosterGoals, updateRosterRem} = props; // Unpack props

  const [modalVis, setModalVis] = useState(false); // SettingsModal visibility

  // Table state variable for character goals.
  const [changed, setChanged] = useState(false);
  const [table, updateTable] = useState(initTable);

  // Update signal handlers
  useEffect(() => {
    setGoalData(charIndex, goals); // Update goal data
    updateTable(initTable); // Re-render CharacterGoalTable
    updateRosterGoals(); // Send signal to update RosterGoalTable
    updateRosterRem(); // Send signal to update RosterCard RemTable
  }, [goals]); // Runs on mount and when sources change

  useEffect(() => {
    if (changed){ // Uncommitted changes are present
      saveChars(); // Save updated character data
      setChanged(false); // Signal that changes were committed
    }
  }, [changed]); // Runs when changed changes, does nothing on mount due to initial state false

  function initTable(): ReactNode[]{ // Table state initializer function
    let table: ReactNode[] = []; // Initialize table
        
    for (let i = 0; i < goals.length; i++){ // Build row for each goal
      table.push(
        <GoalRow key={i}
          total={i == goals.length - 1} // Last goal is total
          goal={goals[i]}
          index={i}
          // Parent component state setters
          setChanged={setChanged}
          setGoal={setGoal}
        />
      );
    }
    return table;
  }

  function SettingsModal(){
    // State variables for storing uncommitted changes to goals
    const [tempGoals, setTempGoals] = useState(initTempGoals);
    const [tempTotal, setTempTotal] = useState(initTempTotal);
    const [tempRosterGoals, setTempRosterGoals] = useState(initTempRosterGoals);

    function initTempGoals(): Goal[]{ // temp state initializer function
      // Deep copy goals excluding "Total" from goals
      return JSON.parse(JSON.stringify(goals.slice(0, -1)));
    }

    function initTempTotal(): Goal{ // tempTotal state initializer function
      // Deep copy "Total" goal from goals
      return JSON.parse(JSON.stringify(goals[goals.length - 1]));
    }

    function initTempRosterGoals(): RosterGoal[]{ // tempRosterGoals state initializer function
      // Deep copy roster goals
      return JSON.parse(JSON.stringify(getRosterGoals()));
    }

    function handleAddGoal(){
      // console.log("tempRosterGoals[0] before add:", tempRosterGoals[0].goals[0]);

      // Deep copy roster goals from tempRosterGoals
      let expandedRosterGoals: RosterGoal[] = JSON.parse(JSON.stringify(tempRosterGoals));

      expandedRosterGoals.forEach((rosterGoal: RosterGoal) => { // For each roster goal,
        // Expand roster goal entry for current charIndex
        rosterGoal.goals[charIndex].push(false); // Default to false
      });

      // Update state variable with blank goal
      setTempGoals([...tempGoals, initGoal()]);
      // Update state variable with expanded roster goals
      setTempRosterGoals(expandedRosterGoals);

      // console.log("tempRosterGoals[0] after add:", expandedRosterGoals[0].goals[0]);
    }

    function handleDelete(index: number){
      // Deep copy goal total from tempTotal
      let total: Goal = JSON.parse(JSON.stringify(tempTotal));
      // Deep copy roster goals from tempRosterGoals
      let contractedRosterGoals: RosterGoal[] = JSON.parse(JSON.stringify(tempRosterGoals));

      // console.log("tempRosterGoals[0] before delete:", tempRosterGoals[0].goals[0]);

      // Subtract deleted goal's mats from total goal
      total.mats = subMaterials(total.mats, tempGoals[index].mats);

      // Contract all roster goal entries for the current charIndex
      contractedRosterGoals.forEach((rosterGoal: RosterGoal) => { // For each roster goal,
        // Contract roster goal entry for current character by slicing out specified index
        rosterGoal.goals[charIndex] = [...rosterGoal.goals[charIndex].slice(0, index), ...rosterGoal.goals[charIndex].slice(index + 1)];
      });
  
      // Delete the specified source by slicing out specified index from temp
      setTempGoals([...tempGoals.slice(0, index), ...tempGoals.slice(index + 1)]);
      setTempTotal(total); // Update tempTotal with newly computed total.mats
      // Update state variable with contracted roster goals
      setTempRosterGoals(contractedRosterGoals);

      // console.log("tempRosterGoals[0] after delete:", contractedRosterGoals[0].goals[0]);
    }

    function handleSwap(activeIndex: number, overIndex: number){
      // Deep copy roster goals from tempRosterGoals
      let movedRosterGoals: RosterGoal[] = JSON.parse(JSON.stringify(tempRosterGoals));

      // console.log("tempRosterGoals[0] before swap:", tempRosterGoals[0].goals[0]);

      // Swap roster goal entries for the current charIndex
      movedRosterGoals.forEach((rosterGoal: RosterGoal) => { // For each roster goal,
        // Update roster goal entry for current character by moving swapped item
        rosterGoal.goals[charIndex] = arrayMove(rosterGoal.goals[charIndex], activeIndex, overIndex);
      });

      // Update state variable with moved roster goals
      setTempRosterGoals(movedRosterGoals);

      // console.log("tempRosterGoals[0] after swap:", movedRosterGoals[0].goals[0]);
    }

    function saveChanges(){
      setGoals([...tempGoals, tempTotal]); // Apply uncommitted changes
      setRosterGoals(tempRosterGoals); // Apply uncommitted changes
      updateRosterGoals(); // Send signal to update RosterCard goalsTable
      updateRosterRem(); // Send signal to update RosterCard remTable
      setChanged(true); // Save character data
      setModalVis(false); // Close modal
    }

    return(
      <Modal show={modalVis} centered>
        <Modal.Header>
          <Modal.Title>Configure Goals for {charName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Drag and drop goals to reorder them, or click the trash button to delete them.</p>
          <SortableList
            items={tempGoals}
            onChange={setTempGoals}
            renderItem={(item: Goal, index: number) => (
              <SortableList.Item id={item.id}>
                {item.id}
                <div>
                  <SortableList.DeleteButton handleDelete={handleDelete} index={index}/>
                  <SortableList.DragHandle/>
                </div>
              </SortableList.Item>
            )}
            moveHandler={handleSwap}
          />
          <Button className="d-block mx-auto" variant="primary" onClick={handleAddGoal}>Add Goal</Button>
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
      <SettingsModal/> {/* Hidden until setModalVis(true) onClick*/}
      <Table className="m-0" hover>
        <thead>
          <tr className="bold">
            <td className="section-title goals" colSpan={1}>Goals</td>
            <td className="section-title goal-btns" colSpan={10}>
              <Button variant="primary" onClick={() => setModalVis(true)}>Configure Goals</Button>
            </td>
          </tr>
        </thead>
        <tbody>
          {table}
        </tbody>
      </Table>
    </>
  );
}