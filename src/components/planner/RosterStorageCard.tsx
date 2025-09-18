import './RosterStorageCard.css';

import {type ChangeEvent, type JSX, useState} from 'react';

import {Cell} from './tables/Cell';

import {type Materials, type Source} from '../core/types';
import {sanitizeInput} from './tables/common';
import {getSources, setRosterMat, saveSources} from '../core/roster-storage-data';

import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

/** Props interface for RosterStorageCard. */
interface RosterStorageCardProps{
  friendlyName: string; // Displayed as the table name (top-left corner)
  color: string; // The color used for this table
  image: string;
  mat: keyof Materials; // The material associated with this table

  // If defined, this RosterStorageTable is a combo table (e.g., reds/blues)
  color2?: string; // The color used for the second material area of this table
  image2?: string;
  mat2?: keyof Materials; // The second material associated with this table
}

// If true, changes will be committed by saveRosterMats() on next onBlur event.
let changed: boolean = false;

/** Constructs the "Goals" section of the parent table. */
export function RosterStorageCard(props: RosterStorageCardProps): JSX.Element{
  let {friendlyName, color, image, mat, color2, image2, mat2} = props; // Unpack props

  // Get const references to sources for this table's material(s)
  const sources = getSources(mat);

  // Table state variable for materials sources.
  const [table, updateTable] = useState(initTable);

  function initTable(): JSX.Element[]{ // Table state initializer function
    let table: JSX.Element[] = []; // Initialize table
    
    for (let i = 0; i < sources.length - 1; i++) // Build row for each source
      table.push(<SourceRow key={sources[i].label} index={i}/>);

    // Build the total row and push it to the table
    table.push(<SourceRow total key="total" index={sources.length - 1}/>);
    return table;
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    let input: number = Number(e.target.value); // Variables for readability
    let changedSrc: Source = sources[index];
    let total: Source = sources[sources.length - 1];
    
    if (sanitizeInput(e, sources[index].qty[matIndex])){ // Valid numeric input
      total.amt[matIndex] -= changedSrc.amt[matIndex]; // Subtract old amount from total
      changedSrc.qty[matIndex] = input; // Update source quantity
      updateAmt(changedSrc, matIndex); // Update source amount
      total.amt[matIndex] += changedSrc.amt[matIndex]; // Add new amount to total

      // Update roster storage data (which material is set depends on matIndex)
      setRosterMat(matIndex ? mat2! : mat, total.amt[matIndex]);

      if (changedSrc.selectionChest){ // Changed source is a selection chest
        // Note: For selection chest, matIndex always 0, mat2 always defined
        total.amt[1] -= changedSrc.amt[1]; // Subtract old amount from total
        changedSrc.qty[1] = input; // Update (synchronize) source quantity
        updateAmt(changedSrc, 1); // Update source amount
        total.amt[1] += changedSrc.amt[1]; // Add new amount to total

        // Update roster storage data for material 2
        setRosterMat(mat2!, total.amt[1]);
      }

      updateTable([
        ...table.slice(0, index), // Sources before specified index
        <SourceRow key={changedSrc.label} index={index}/>,
        ...table.slice(index + 1, -1), // Sources after specified index
        <SourceRow total key="total" index={sources.length - 1}/>,
      ]); // Only re-renders the row being updated and the total row

      changed = true; // Roster storage data will be saved on next focus out
    } // Reject non-numeric input outside of name field (do nothing)
  }

  function handleChecked(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    let changedSrc: Source = sources[index]; // Variables for readability
    let total: Source = sources[sources.length - 1];

    /* Update changedSrc.selected (guaranteed to be defined in
       handleChecked, otherwise checkboxes would not render) */
    changedSrc.selected![matIndex] = e.target.checked;

    // Update source and total amounts based on selecting or deselecting
    if (e.target.checked){ // Selecting
      updateAmt(changedSrc, matIndex); // Update source amount
      total.amt[matIndex] += changedSrc.amt[matIndex]; // Add new amount to total
    }
    else{ // Deselecting
      total.amt[matIndex] -= changedSrc.amt[matIndex]; // Subtract amount from total
      changedSrc.amt[matIndex] = 0; // Set source amount to 0
    }

    // Update roster storage data (which material is set depends on matIndex)
    setRosterMat(matIndex ? mat2! : mat, total.amt[matIndex]);

    // Changed source is combo selection chest, update source's other material
    if (changedSrc.selectionChest){
      let otherIndex: number = (matIndex == 0) ? 1 : 0

      // Set source's other material "selected" field to opposite value
      changedSrc.selected![otherIndex] = !e.target.checked;

      // Update source and total amounts based on selecting or deselecting
      if (!e.target.checked){ // Selecting (by deselecting other)
        updateAmt(changedSrc, otherIndex); // Update source amount
        total.amt[otherIndex] += changedSrc.amt[otherIndex]; // Add new amount to total
      }
      else{ // Deselecting (by selecting other)
        total.amt[otherIndex] -= changedSrc.amt[otherIndex]; // Subtract amount from total
        changedSrc.amt[otherIndex] = 0; // Set source amount to 0
      }

      // Update roster storage data (which material is set depends on otherIndex)
      setRosterMat(otherIndex ? mat2! : mat, total.amt[otherIndex]);
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
    let src: Source = sources[index]; // Variable for readability
    let cells: JSX.Element[] = []; // Initialize table row for this source

    console.log(mat, "SourceRow", index, "rendering");

    cells.push(<Cell bold key="label" value={src.label}/>); // Source label

    cells.push( // Material 1 quantity field
      <Cell key="qty" value={(total) ? undefined : src.qty[0]}
        onBlur={total ? undefined : () => {if (changed){saveSources(mat)}; changed = false}}
        onChange={total ? undefined : (e) => handleChange(e, index, 0)}
      /> // Input disabled if total
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
    cells.push(
      <Cell bold key="amt"
        // If src.selected defined and false, amount = 0, else src.amt
        value={(src.selected && !src.selected[0]) ? 0 : src.amt[0]}
      />
    );

    if (mat2){ // If combo table, push cells for second material
      cells.push( // Material 2 quantity field
        <Cell key="qty2" className="mat2" value={(total) ? undefined : src.qty[1]}
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
      cells.push(
        <Cell bold key="amt2" className="mat2"
          // If src.selected defined and false, amount = 0, else src.amt
          value={(src.selected && !src.selected[1]) ? 0 : src.amt[1]}
        />
      );
    }
    return <tr>{cells}</tr>;
  }

  return(
    <Col style={{"--table-color": color, "--mat2-color": color2} as React.CSSProperties}>
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
        </thead>
        <tbody>
          {table}
        </tbody>
      </Table>
    </Col>
  );
}

/** Given src and matIndex, update src.amt[matIndex]. */
function updateAmt(src: Source, matIndex: number){
  // If src.selected is defined and false, source is inactive
  if (src.selected && !src.selected[matIndex]){
    src.amt[matIndex] = 0; // Set amount to 0
    return;
  }

  let amt: number = src.qty[matIndex]; // Start from source quantity
  if (src.div) // Apply floor divisor if present
    amt = Math.floor(amt / src.div);
  if (src.mult) // Apply multiplier if present
    amt *= src.mult[matIndex];

  src.amt[matIndex] = amt; // Update source amount
}