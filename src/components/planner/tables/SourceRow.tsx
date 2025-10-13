import {type ChangeEvent, type ReactNode, useContext, useEffect, useState} from 'react';

import {Cell} from './Cell';
import {SyncContext} from '../../../pages/planner-tabs/RosterStorageView';

import {type Source} from '../../core/types';
import {sanitizeInput} from './common';

import Form from 'react-bootstrap/Form';

// If true, changes will be committed by saveSources() on next onBlur event.
let changed: boolean = false;

/** Props interface for SourceRow. */
interface SourceRowProps{
  total?: boolean; // If true, this row represents the table total.
  src: Source; // The Source that this SourceRow is displaying.
  index: number; // The index of the Source that this SourceRow is displaying.
  combo?: boolean; // If true, src is a combo source (e.g., reds/blues)

  /** References to parent component state/state setters */
  // Signals to parent component to save uncommitted changes.
  setChanged(changed: boolean): void;
  // Updates source srcIndex, source total, and rosterMats.
  setSource(srcIndex: number, matIndex: number, qty?: number, selected?: boolean, newUse?: number[]): void;

  // If defined, this SourceRow's parent table synchronizes with an external table.
  syncRow?: boolean; // If true, this SourceRow synchronizes with an external SourceRow.
  syncMatIndex?: number; // Index of mat this table represents in the sync pair
}

// Generate a table row for the "Roster Storage" section.
export function SourceRow(props: SourceRowProps): ReactNode{
  let {total, src, index, combo, setChanged, setSource,
       syncRow, syncMatIndex} = props; // Unpack props

  // State variables for controlled input fields, initialize with source data
  const [use, setUse] = useState(src.use);
  const [qty, setQty] = useState(src.qty);

  const syncContext = useContext(SyncContext);
  let {dailyChestQty, setDailyChestQty,
       dailyChestUse, setDailyChestUse} = syncContext; // Unpack sync context


  // Daily chest synchronization signal handlers
  useEffect(() => { // Synchronized table quantity update hook
    if (syncRow && dailyChestQty && dailyChestQty.length) // Received non-empty signal
      setQty(dailyChestQty); // Update qty state variable
  }, [dailyChestQty]); // Runs when dailyChestQty changes, does nothing on mount due to empty signal

  useEffect(() => { // Synchronized table "Use" update hook
    if (syncRow && dailyChestUse && dailyChestUse.length){ // Received non-empty signal
      // If syncMatIndex == 1, second mat in sync pair, reverse "use" array
      let newUse: number[] = [dailyChestUse[syncMatIndex ? 1 : 0], dailyChestUse[syncMatIndex ? 0 : 1]];
      setUse(newUse); // Update use state variable
      setSource(index, 0, dailyChestQty[0], undefined, newUse); // Update sources
      setChanged(true); // Save roster storage data for this mat
    }
  }, [dailyChestUse]); // Runs when dailyChestUse changes, does nothing on mount due to empty signal


  function handleQtyChange(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    let input: number = Number(e.target.value); // For readability
    let prevValue: number = src.qty[matIndex];
    let diff: number = input - prevValue;
    
    if (sanitizeInput(e, prevValue)){ // Valid numeric input
      if (use){ // src is a selection chest
        let newUse: number[] = [...use!]; // Copy use state variable
        newUse[matIndex] += diff; // Update mat use qty by diff

        if (newUse[matIndex] < 0){ // Use qty cannot be negative
          // Set other mat use qty to maximum value (src.qty)
          newUse[matIndex ? 0 : 1] = input;
          newUse[matIndex] = 0; // Set use qty to 0
        }

        if (syncRow){ // Special case: daily chests synced with external table
          setDailyChestQty(input); // Sync quantity fields
          // If syncMatIndex == 1, second mat in sync pair, reverse "use" array
          setDailyChestUse([newUse[syncMatIndex ? 1 : 0], newUse[syncMatIndex ? 0 : 1]]);
        }
        else{ // Standard selection chest
          setQty([input, input]); // Update qty state variable
          setUse(newUse); // Update use state variable
          setSource(index, matIndex, input, undefined, newUse); // Update sources
        }
      }
      else{ // Not a selection chest, simply update source quantity to input
        setQty([
          ...qty.slice(0, matIndex), // Updates qty[1] if matIndex == 1
          input,
          ...qty.slice(matIndex + 1) // Updates qty[0] if matIndex == 0
        ]);
        setSource(index, matIndex, input); // Update sources
        changed = true; // Roster storage data will be saved on next focus out
      }
    } // Reject non-numeric input (do nothing)
  }

  function handleChecked(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    setSource(index, matIndex, undefined, e.target.checked); // Update sources
    setChanged(true); // Save roster storage data for this mat
  }

  function handleUseChange(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    let input: number = Number(e.target.value); // For readability
    let prevValue: number = src.use![matIndex];
    let diff: number = input - prevValue;
    
    if (sanitizeInput(e, prevValue)){ // Valid numeric input
      let newUse: number[] = [...use!]; // Copy use state variable

      if (input <= src.qty[matIndex]){ // Limit use quantity to src.qty
        newUse[matIndex] = input; // Update use qty for mat
        newUse[matIndex ? 0 : 1] -= diff; // Subtract diff from other mat
      }
      else{ // Use quantity exceeds src.qty
        newUse[matIndex] = src.qty[matIndex]; // Set use qty to src.qty
        newUse[matIndex ? 0 : 1] = 0; // Set other mat use qty to 0
      }

      if (syncRow) // Special case: daily chests synced with external table
        // If syncMatIndex == 1, second mat in sync pair, reverse "use" array
        setDailyChestUse([newUse[syncMatIndex ? 1 : 0], newUse[syncMatIndex ? 0 : 1]]);
      else{
        setUse(newUse); // Update use state variable
        setSource(index, matIndex, undefined, undefined, newUse); // Update sources
        changed = true; // Roster storage data will be saved on next focus out
      }
    } // Reject non-numeric input (do nothing)
  }

  return(
    <tr>
      <Cell bold key="label" className="src-label" value={src.id}/>
      <Cell key="qty" className="qty" controlledValue={total ? undefined : qty[0]} // Empty if total
        onBlur={total ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
        onChange={total ? undefined : (e) => handleQtyChange(e, index, 0)}
      />{/* Input disabled if total */}

      {/* "Use?" column may be empty, a checkbox, or an input. */}
      {!src.sel && !use && // src.sel, src.use not defined, render empty cell
        <td key="use" className="read-only qty"></td>
      }
      {src.sel && // src.sel defined, render checkbox
        <td key="use" className="read-only qty">
          <Form.Check className="mat1-checkbox"
            type="checkbox"
            defaultChecked={src.sel[0]}
            onChange={(e) => handleChecked(e, index, 0)}
          />
        </td>
      }
      {use && // src.use defined, render input
        <Cell key="use" className="qty" controlledValue={use[0]}
          onBlur={total ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
          onChange={total ? undefined : (e) => handleUseChange(e, index, 0)}
        />
      }

      <Cell bold key="amt" className="qty" value={src.amt[0]}/>

      {combo && // Render cells for second material
        <>
          <Cell bold key="label2" className="mat2 src-label" value={src.id}/>
          <Cell key="qty2" className="mat2 qty" controlledValue={total ? undefined : qty[1]} // Empty if total
            onBlur={total ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
            onChange={total ? undefined : (e) => handleQtyChange(e, index, 1)}
          />{/* Input disabled if total */}

          {/* "Use?" column may be empty, a checkbox, or an input. */}
          {!src.sel && !use && // src.sel, src.use not defined, render empty cell
            <td key="use2" className="read-only mat2 qty"></td>
          }
          {src.sel && // src.sel defined, render checkbox
            <td key="use2" className="read-only mat2 qty">
              <Form.Check className="mat2-checkbox"
                type="checkbox"
                defaultChecked={src.sel[1]}
                onChange={(e) => handleChecked(e, index, 1)}
              />
            </td>
          }
          {use && // src.use defined, render input
            <Cell key="use2" className="mat2 qty" controlledValue={use[1]}
              onBlur={total ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
              onChange={total ? undefined : (e) => handleUseChange(e, index, 1)}
            />
          }

          <Cell bold key="amt2" className="mat2 qty" value={src.amt[1]}/>
        </>
      }
    </tr>
  );
}