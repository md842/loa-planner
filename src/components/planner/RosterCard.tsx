import {type ReactNode, useEffect, useState} from 'react';

import {TableHeader} from './tables/TableHeader';
import {RosterGoalTable} from './tables/RosterGoalTable';
import {RemTable} from './tables/RemTable';

import {type Character, type Goal, type Materials, addMaterials, initMaterials, subMaterials, type RosterGoal} from '../core/types';
import {getRosterGoals, setRosterGoalName} from '../core/character-data';
import {getRosterMats} from '../core/roster-storage-data';

import Button from 'react-bootstrap/Button';

/** Props interface for RosterTable. */
interface RosterCardProps{
  chars: Character[];
  // References to parent component state/state setters
  rosterGoalUpdateSignal: unknown[];
  rosterRemUpdateSignal: unknown[];
  setOnTop: React.Dispatch<React.SetStateAction<boolean>>;
  updateRosterGoals(): void; // Sends signal to update RosterCard GoalTable
  updateRosterRem(): void; // Sends signal to update RosterCard RemTable
}

/** Constructs the card for the roster goals. */
export function RosterCard(props: RosterCardProps): ReactNode{
  let {chars, rosterGoalUpdateSignal, rosterRemUpdateSignal, setOnTop, updateRosterGoals, updateRosterRem} = props; // Unpack props

  /* Stores the conversion of roster goals to roster card table goals.
     RosterGoalTable and RemTable sync with this state via useEffect hooks.
     Will be initialized when useEffect runs on mount, so initialize blank. */
  const [tableGoals, setTableGoals] = useState([] as Goal[]);
  const [remTableGoals, setRemTableGoals] = useState([] as Goal[]);

  // Update signal handlers
  useEffect(() => { // Triggers useEffect in RosterGoalTable with new goal data
    setTableGoals(calculateTableGoals); // Re-calculate table goals
  }, [rosterGoalUpdateSignal]); // Runs on mount and when signal received

  useEffect(() => { // Triggers useEffect in RemTable with new goal data
    setRemTableGoals(calculateRemTableGoals); // Re-calculate table goals
  }, [rosterRemUpdateSignal]); // Runs on mount and when signal received

  /** Calculates goals for RosterCard given roster goal data. */
  function calculateTableGoals(): Goal[]{
    let tableGoals: Goal[] = []; // Initialize table goal array

    getRosterGoals().forEach((rosterGoal: RosterGoal) => {
      // Calculate a tableGoal for each roster goal
      let tableGoal: Goal = {id: rosterGoal.id, mats: initMaterials()};

      rosterGoal.goals.forEach((charGoals: boolean[], charIndex: number) => {
        charGoals.forEach((goalIncluded: boolean, goalIndex: number) => {
          if (goalIncluded) // Accumulate included goals in tableGoal.mats
            tableGoal.mats = addMaterials(tableGoal.mats, chars[charIndex].goals[goalIndex].mats);
        });
      });
      tableGoals.push(tableGoal); // Push completed tableGoal
    });
    return tableGoals;
  }

  /** Calculates remaining materials for RosterCard given roster goal data. */
  function calculateRemTableGoals(): Goal[]{
    let remTableGoals: Goal[] = []; // Initialize table goal array

    getRosterGoals().forEach((rosterGoal: RosterGoal) => {
      // Calculate a remTableGoal for each roster goal
      let remTableGoal: Goal = {id: rosterGoal.id, mats: initMaterials()};

      rosterGoal.goals.forEach((charGoals: boolean[], charIndex: number) => {
        /* For each character, determine the remaining bound materials required
           to finish all the character goals included in this rosterGoal. */
        let charRemBound: Materials = initMaterials();

        charGoals.forEach((goalIncluded: boolean, goalIndex: number) => {
          if (goalIncluded) // Accumulate char's included goals in charRemBound
            charRemBound = addMaterials(charRemBound, chars[charIndex].goals[goalIndex].mats);
        });
        /* Subtract current char's bound materials from the sum of its included
           goals. Fine if no char goals included, subMaterials floors to 0. */
        charRemBound = subMaterials(charRemBound, chars[charIndex].boundMats);
        // Accumulate charRemBound for each char in remTableGoal.mats
        remTableGoal.mats = addMaterials(remTableGoal.mats, charRemBound);
      });
      // Finally, subtract roster mats from the sum of all charRemBounds.
      remTableGoal.mats = subMaterials(remTableGoal.mats, getRosterMats());
      remTableGoals.push(remTableGoal); // Push completed remTableGoal
    });
    return remTableGoals;
  }

  /** Updates goal goalIndex. */
  function setGoal(goalIndex: number, id: string){
    setRosterGoalName(goalIndex, id); // Update roster goal name

    /* Renaming roster goals does not require table goal recalculation
       (expensive). Skip recalculation by renaming existing table goals. */
    setTableGoals([ // Update goals state variable
      ...tableGoals.slice(0, goalIndex), // Goals before goalIndex
      {...tableGoals[goalIndex], id: id}, // Rename tableGoal goalIndex
      ...tableGoals.slice(goalIndex + 1) // Goals after goalIndex
    ]);
    setRemTableGoals([ // Update remGoals state variable
      ...remTableGoals.slice(0, goalIndex), // remGoals before goalIndex
      {...remTableGoals[goalIndex], id: id}, // Rename remTableGoal goalIndex
      ...remTableGoals.slice(goalIndex + 1) // remGoals after goalIndex
    ]);
  }

  return(
    <div className="mb-4" style={{"--table-color": "#777"} as React.CSSProperties}>
      <div className="settings-tab">
        <Button variant="link" onClick={() => setOnTop(true)}>
          <i className="bi bi-chevron-up"/>
        </Button>
        <Button variant="link" onClick={() => setOnTop(false)}>
          <i className="bi bi-chevron-down"/>
        </Button>
      </div>
      <TableHeader title={<th>Roster Goals</th>}/>
      <RosterGoalTable
        goals={tableGoals}
        remGoals={remTableGoals}
        chars={chars}
        setGoal={setGoal}
        setGoals={setTableGoals}
        setRemGoals={setRemTableGoals}
        updateRosterGoals={updateRosterGoals}
        updateRosterRem={updateRosterRem}
      />
      {remTableGoals.length > 0 && // Skip rendering if no roster goals set
        <RemTable goals={remTableGoals}/>
      }
    </div>
  );
}