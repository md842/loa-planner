import {type ChangeEvent, type JSX, useState} from 'react';

import {Cell} from './Cell';

import {type Materials, type Source} from '../../core/types';
import {sanitizeInput} from './common';
import {getSources, setRosterMat} from '../../core/roster-storage-data';

import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

/** Props interface for RosterStorageTable. */
interface RosterStorageTableProps{
  friendlyName: string; // Displayed as the table name (top-left corner)
  mat: keyof Materials; // The material associated with this RosterStorageTable
  // If defined, this RosterStorageTable is a combo table (e.g., reds/blues)
  mat2?: keyof Materials; // The second material associated with this RosterStorageTable
}

/** Constructs the "Goals" section of the parent table. */
export function RosterStorageTable(props: RosterStorageTableProps): JSX.Element{
  let {friendlyName, mat, mat2} = props; // Unpack props

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

      updateTable([
        ...table.slice(0, index), // Sources before specified index
        <SourceRow key={changedSource.label} index={index}/>,
        ...table.slice(index + 1, -1), // Sources after specified index
        <SourceRow total key="total" index={sources.length - 1}/>,
      ]); // Only re-renders the row being updated and the total row

      // Update roster storage data (which material is set depends on matIndex)
      setRosterMat(matIndex ? mat2! : mat, totalSource.qty[matIndex]);
    } // Reject non-numeric input outside of name field (do nothing)
  }

  function handleChecked(e: ChangeEvent<HTMLInputElement>, index: number, matIndex: number){
    let changedSource: Source = sources[index]; // Variables for readability
    let totalSource: Source = sources[sources.length - 1];

    /* Update changedSource.selected (guaranteed to be defined in
       handleChecked, otherwise checkboxes would not render) */
    changedSource.selected![matIndex] = e.target.checked;

    totalSource.qty[matIndex] += // Update total quantity
      // If selected, add qty * mult; if not selected, subtract qty * mult
      ((changedSource.selected![matIndex]) ? 1 : -1) *
      (changedSource.qty[matIndex] * changedSource.mult[matIndex]);

    updateTable([
      ...table.slice(0, index), // Sources before specified index
      <SourceRow key={changedSource.label} index={index}/>,
      ...table.slice(index + 1, -1), // Sources after specified index
      <SourceRow total key="total" index={sources.length - 1}/>,
    ]); // Only re-renders the row being updated and the total row

    // Update roster storage data (which material is set depends on matIndex)
    setRosterMat(matIndex ? mat2! : mat, totalSource.qty[matIndex]);
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
        // onBlur={() => {saveChanges(changed); changed = false}}
        onChange={total ? undefined : (e) => handleChange(e, index, 0)}
      />
    );
    
    cells.push( // Material 1 selected field
      <td className="read-only" key="sel">
        {src.selected && // Render checkbox conditionally
          <Form.Check
            type="checkbox"
            defaultChecked={src.selected[0]}
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
        <Cell key="qty2" value={(total) ? undefined : src.qty[1]}
          // onBlur={() => {saveChanges(changed); changed = false}}
          onChange={total ? undefined : (e) => handleChange(e, index, 1)}
        />
      );
      
      cells.push( // Material 2 selected field
        <td className="read-only" key="sel2">
          {src.selected && // Render checkbox conditionally
            <Form.Check
              type="checkbox"
              defaultChecked={src.selected[1]}
              onChange={(e) => handleChecked(e, index, 1)}
            />}
        </td>);

      // Material 2 amount field
      cells.push(
        <Cell bold key="amt2"
          // If src.selected defined and false, amount = 0, else qty * mult
          value={(src.selected && !src.selected[1]) ? 0 : src.qty[1] * src.mult[1]}
        />
      );
    }
    return <tr>{cells}</tr>;
  }

  return(
    <Table hover>
      <thead>
        <tr>
          <th>{friendlyName}</th>
          <th>Image Placeholder</th>
          <th>Use?</th>
          <th>Amount</th>
          {mat2 && <>
            <th>Image 2 Placeholder</th>
            <th>Use?</th>
            <th>Amount</th>
          </>}
        </tr>
      </thead>
      <tbody>
        {table}
      </tbody>
    </Table>
  );
}