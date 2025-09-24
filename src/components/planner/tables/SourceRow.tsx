import {type ChangeEvent, type JSX, useEffect, useState} from 'react';

import {Cell} from './Cell';

import {type Source} from '../../core/types';
import {sanitizeInput} from './common';

import Form from 'react-bootstrap/Form';

/** Props interface for SourceRow. */
interface SourceRowProps{
  total?: boolean; // If true, this row represents the table total.
  src: Source; // The Source that this SourceRow is displaying.
  index: number; // The index of the Source that this SourceRow is displaying.
  combo?: boolean; // If true, src is a combo source (e.g., reds/blues)

  /** References to parent component state/state setters */
  // Updates source srcIndex, source total, and rosterMats.
  setSource(srcIndex: number, matIndex: number, qty?: number, selected?: boolean, newUse?: number[]): void;
  // Signals to parent component to save uncommitted changes.
  setChanged(changed: boolean): void;

  // References to parent component state/state setters for synchronized tables
  /* If defined, this table is a controlled table; its daily chests field is
     controlled by another table's. setDailyChestQty must not be defined. */
  dailyChests?: number[];
  /* If defined, this table is a controlling table; its daily chests field
     controls another table's. dailyChests must not be defined. */
  setDailyChestQty?: (qty: number) => void;

  /* The following prop must be defined if either prop above is defined.
     Signal [true] if daily chests are selected in the controlling table,
            [false] if daily chests are selected in the controlled table. */
  setDailyChestSel?: (controllingTable: boolean) => void;
}

// If true, changes will be committed by saveRosterMats() on next onBlur event.
let changed: boolean = false;

/**
 * Generate a table row for the "Roster Storage" section.
 * @param  {boolean}        total     If true, this row represents the table total.
 * @param  {number}         index     The index of the source to use for this row.
 * @return {JSX.Element[]}            The generated table row.
 */
export function SourceRow(props: SourceRowProps): JSX.Element{
  let {total, src, index, setSource, combo, setChanged,
       dailyChests, setDailyChestQty,
       setDailyChestSel} = props; // Unpack props

  const [use, setUse] = useState(src.use);

  // Update signal handlers
  useEffect(() => {
    if (use)
      console.log("use state updated:", use);
  }, [use]); // Runs on mount and when use changes

  function handleQtyChange(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    let input: number = Number(e.target.value); // For readability
    let prevValue: number = src.qty[matIndex];
    let diff: number = input - prevValue;
    
    if (sanitizeInput(e, prevValue)){ // Valid numeric input
      if (use){ // src is a selection chest
        let newUse: number[] = [...use]; // Shallow copy use state variable

        newUse[matIndex] += diff; // Update use qty for mat
        if (newUse[matIndex] < 0){ // Use qty cannot be negative
          // Set other mat use qty to src.qty (maximum value)
          newUse[matIndex ? 0 : 1] = input;
          newUse[matIndex] = 0; // Set use qty to 0
        }
        setUse(newUse); // Update use state variable
        setSource(index, matIndex, input, undefined, newUse); // Update sources
      }
      else // Not a selection chest, simply update source quantity to input
        setSource(index, matIndex, input);

      /* Special case: daily chests (source index 0) synced between tables.
         Signal received by controlled table only, so send signal at end of
         handleChange of controlling table. */
      if (setDailyChestQty && index == 0)
        setDailyChestQty(input); // Sync quantity fields

      changed = true; // Roster storage data will be saved on next focus out
    } // Reject non-numeric input outside of name field (do nothing)
  }

  function handleUseChange(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    let input: number = Number(e.target.value); // For readability
    let prevValue: number = src.use![matIndex];
    let diff: number = input - prevValue;
    
    if (sanitizeInput(e, prevValue)){ // Valid numeric input
      let newUse: number[] = [...use!]; // Shallow copy use state variable

      if (input <= src.qty[matIndex]){ // Limit use quantity to src.qty
        newUse[matIndex] = input; // Update use qty for mat
        newUse[matIndex ? 0 : 1] -= diff; // Subtract diff from other mat
      }
      else{ // Use quantity exceeds src.qty
        newUse[matIndex] = src.qty[matIndex]; // Set use qty to src.qty
        newUse[matIndex ? 0 : 1] = 0; // Set other mat use qty to 0
      }
      setUse(newUse); // Update use state variable
      setSource(index, matIndex, undefined, undefined, newUse); // Update sources

      /* Special case: daily chests (source index 0) synced between tables.
         Signal received by controlled table only, so send signal at end of
         handleChange of controlling table. */
      if (setDailyChestQty && index == 0)
        setDailyChestQty(input); // Sync quantity fields

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
    setSource(index, matIndex, undefined, e.target.checked); // Update sources
    setChanged(true); // Save roster storage data for specified mat
  }

  return(
    <tr>
      <Cell bold key="label" value={src.id}/>
      <Cell key="qty" value={total ? undefined : src.qty[0]} // Empty if total
        onBlur={(total || (dailyChests && index == 0)) ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
        onChange={(total || (dailyChests && index == 0)) ? undefined : (e) => handleQtyChange(e, index, 0)}
      />{/* Input disabled if total or daily chests of controlled table */}

      {/* "Use?" column may be empty, a checkbox, or an input. */}
      {!src.sel && !use && // src.use not defined, render empty cell
        <td className="read-only" key="use"></td>
      }
      {src.sel && // Boolean, render checkbox
        <td className="read-only" key="use">
          <Form.Check className="mat1-checkbox"
            type="checkbox"
            defaultChecked={src.sel[0]}
            onChange={(e) => handleChecked(e, index, 0)}
          />
        </td>
      }
      {use && // Number, render input
        <Cell key="use" controlledValue={use[0]}
          onBlur={total ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
          onChange={total ? undefined : (e) => handleUseChange(e, index, 0)}
        />
      }
      

      <Cell bold key="amt" value={src.amt[0]}/>
      {combo &&
        <>
          <Cell key="qty2" className="mat2" value={(total) ? undefined : src.qty[1]} // Empty if total
            onBlur={total || use ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
            onChange={total || use ? undefined : (e) => handleQtyChange(e, index, 1)}
          />{/* Input disabled if total or selection chest (use material 1 field)*/}

          {/* "Use?" column may be empty, a checkbox, or an input. */}
          {!src.sel && !use && // src.use not defined, render empty cell
            <td className="read-only mat2" key="use2"></td>
          }
          {src.sel && // Boolean, render checkbox
            <td className="read-only mat2" key="use2">
              <Form.Check className="mat2-checkbox"
                type="checkbox"
                defaultChecked={src.sel[1]}
                onChange={(e) => handleChecked(e, index, 1)}
              />
            </td>
          }
          {use && // Number, render input
            <Cell key="use2" className="mat2" controlledValue={use[1]}
              onBlur={total ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
              onChange={total ? undefined : (e) => handleUseChange(e, index, 1)}
            />
          }

          <Cell bold key="amt2" className="mat2" value={src.amt[1]}/>
        </>
      }
    </tr>
  );
}