import {type ChangeEvent, type JSX} from 'react';

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
  setSource(srcIndex: number, matIndex: number, qty?: number, selected?: boolean): void;
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

  function handleChange(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    let input: number = Number(e.target.value); // For readability
    
    if (sanitizeInput(e, src.qty[matIndex])){ // Valid numeric input
      setSource(index, matIndex, input); // Update source quantity to input
      
      if (src.selectionChest) // Changed source is a selection chest
        // Note: For selection chest, matIndex always 0, mat2 always defined
        setSource(index, 1, input); // Update source quantity to input

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

    /* Update changedSrc.selected (guaranteed to be defined in
       handleChecked, otherwise checkboxes would not render) */
    setSource(index, matIndex, undefined, e.target.checked);

    // Changed source is combo selection chest, update source's other material
    if (src.selectionChest){
      let otherIndex: number = (matIndex == 0) ? 1 : 0
      // Set other material's "selected" field to opposite value
      setSource(index, otherIndex, undefined, !e.target.checked);
    }

    setChanged(true); // Save roster storage data for specified mat
  }

  return(
    <tr>
      <Cell bold key="label" value={src.id}/>
      <Cell key="qty" value={total ? undefined : src.qty[0]} // Empty if total
        onBlur={(total || (dailyChests && index == 0)) ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
        onChange={(total || (dailyChests && index == 0)) ? undefined : (e) => handleChange(e, index, 0)}
      />{/* Input disabled if total or daily chests of controlled table */}
      <td className="read-only" key="sel">
        {src.selected && // Render checkbox conditionally
          <Form.Check className="mat1-checkbox"
            type="checkbox"
            // If selection chest, checked = inverse of other checkbox
            defaultChecked={src.selectionChest ? undefined : src.selected[0]}
            checked={src.selectionChest ? !src.selected[1] : undefined}
            onChange={(e) => handleChecked(e, index, 0)}
          />}
      </td>
      <Cell bold key="amt" value={src.amt[0]}/>
      {combo &&
        <>
          <Cell key="qty2" className="mat2" value={(total) ? undefined : src.qty[1]} // Empty if total
            onBlur={total ? undefined : () => {if (changed){setChanged(true)}; changed = false}}
            onChange={(total || src.selectionChest) ? undefined : (e) => handleChange(e, index, 1)}
          />{/* Input disabled if total or selection chest (use material 1 field)*/}
          <td key="sel2" className="read-only mat2">
            {src.selected && // Render checkbox conditionally
              <Form.Check className="mat2-checkbox"
                type="checkbox"
                // If selection chest, checked = inverse of other checkbox
                defaultChecked={src.selectionChest ? undefined : src.selected[1]}
                checked={src.selectionChest ? !src.selected[0] : undefined}
                onChange={(e) => handleChecked(e, index, 1)}
              />}
          </td>
          <Cell bold key="amt2" className="mat2" value={src.amt[1]}/>
        </>
      }
    </tr>
  );
}