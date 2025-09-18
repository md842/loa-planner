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

  let sources = getSources(mat); // Get sources for this table's material(s)

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
    let prevValue: number = sources[index].qty[matIndex];
    let changedSource: Source = sources[index];
    let totalSource: Source = sources[sources.length - 1];
    
    if (sanitizeInput(e, prevValue)){ // Valid numeric input
      // Update total quantity with diff * multiplier
      totalSource.qty[matIndex] += (input - prevValue) * changedSource.mult[matIndex];
      changedSource.qty[matIndex] = input; // Update source quantity
      if (changedSource.selectionChest) // Changed source is a selection chest
        // Set source's material 2 quantity equal to material 1 quantity
        changedSource.qty[1] = input;

      updateTable([
        ...table.slice(0, index), // Sources before specified index
        <SourceRow key={changedSource.label} index={index}/>,
        ...table.slice(index + 1, -1), // Sources after specified index
        <SourceRow total key="total" index={sources.length - 1}/>,
      ]); // Only re-renders the row being updated and the total row

      // Update roster storage data (which material is set depends on matIndex)
      setRosterMat(matIndex ? mat2! : mat, totalSource.qty[matIndex]);

      changed = true; // Roster storage data will be saved on next focus out
    } // Reject non-numeric input outside of name field (do nothing)
  }

  function handleChecked(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    let changedSource: Source = sources[index]; // Variables for readability
    let totalSource: Source = sources[sources.length - 1];

    /* Update changedSource.selected (guaranteed to be defined in
       handleChecked, otherwise checkboxes would not render) */
    changedSource.selected![matIndex] = e.target.checked;

    // If selecting, add from total; if deselecting, subtract from total
    let sign: number = changedSource.selected![matIndex] ? 1 : -1
    // Update total quantity by sign * qty * mult
    totalSource.qty[matIndex] += sign * (changedSource.qty[matIndex] * changedSource.mult[matIndex]);
    // Update roster storage data (which material is set depends on matIndex)
    setRosterMat(matIndex ? mat2! : mat, totalSource.qty[matIndex]);

    // Changed source is combo selection chest, update source's other material
    if (changedSource.selectionChest){
      let otherIndex: number = (matIndex == 0) ? 1 : 0

      // Set source's other material "selected" field to opposite value
      changedSource.selected![otherIndex] = !e.target.checked;

      // Update total quantity by -sign * qty * mult
      totalSource.qty[otherIndex] -= sign * (changedSource.qty[otherIndex] * changedSource.mult[otherIndex]);
      // Update roster storage data (which material is set depends on otherIndex)
      setRosterMat(otherIndex ? mat2! : mat, totalSource.qty[otherIndex]);
    }

    updateTable([
      ...table.slice(0, index), // Sources before specified index
      <SourceRow key={changedSource.label} index={index}/>,
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
        // If src.selected defined and false, amount = 0, else qty * mult
        value={(src.selected && !src.selected[0]) ? 0 : src.qty[0] * src.mult[0]}
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
          // If src.selected defined and false, amount = 0, else qty * mult
          value={(src.selected && !src.selected[1]) ? 0 : src.qty[1] * src.mult[1]}
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