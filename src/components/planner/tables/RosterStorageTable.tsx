import {type ChangeEvent, type JSX, useState} from 'react';

import {Cell} from './Cell';

import {sanitizeInput} from './common';

import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

/** Props interface for RosterStorageTable. */
interface RosterStorageTableProps{
  mat: string;
}

interface Source{
  label: string;
  qty: number;
  hasSelect: boolean;
  selected?: boolean;
  mult: number;
}

// Hardcoded placeholder sources
let sources: Source[] = [
  {label: "Test", qty: 20, hasSelect: true, selected: true, mult: 5},
  {label: "Other", qty: 6426, hasSelect: false, mult: 1},
  {label: "Total", qty: 6526, hasSelect: false, mult: 1}
];

/** Constructs the "Goals" section of the parent table. */
export function RosterStorageTable(props: RosterStorageTableProps): JSX.Element{
  let {mat} = props; // Unpack props

  const [table, updateTable] = useState(initTable);

  console.log(mat, "RosterStorageTable rendering");

  function initTable(): JSX.Element[]{ // Table state initializer function
    let table: JSX.Element[] = []; // Initialize table
    
    for (let i = 0; i < sources.length - 1; i++) // Build row for each source
      table.push(<SourceRow key={sources[i].label} index={i}/>);
    // Build the total row and push it to the table
    table.push(<SourceRow total key="total" index={sources.length - 1}/>);
    return table;
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>, index: number){
    if (sanitizeInput(e, sources[index].qty)){ // Valid numeric input
      // Update total quantity with diff * multiplier
      sources[sources.length - 1].qty += (Number(e.target.value) - sources[index].qty) * sources[index].mult;
      sources[index].qty = Number(e.target.value); // Update source quantity

      updateTable([
        ...table.slice(0, index),
        <SourceRow key={sources[index].label} index={index}/>,
        ...table.slice(index + 1, -1),
        <SourceRow total key="total" index={sources.length - 1}/>,
      ]); // Only re-renders the row being updated and the total row

    } // Reject non-numeric input outside of name field (do nothing)
  }

  function handleChecked(e: ChangeEvent<HTMLInputElement>, index: number){
    sources[index].selected = e.target.checked; // Update selected
    // Update total quantity; if selected, add, if not selected, subtract 
    sources[sources.length - 1].qty += ((sources[index].selected) ? 1 : -1) * (sources[index].qty * sources[index].mult);

    updateTable([
      ...table.slice(0, index),
      <SourceRow key={sources[index].label} index={index}/>,
      ...table.slice(index + 1, -1),
      <SourceRow total key="total" index={sources.length - 1}/>,
    ]); // Only re-renders the row being updated and the total row
  }

  /**
   * Generate a table row for the "Roster Storage" section.
   * @param  {boolean}        total     If true, this row represents the table total.
   * @param  {number}         index     The index of the source to use for this row.
   * @return {JSX.Element[]}            The generated table row.
   */
  function SourceRow(props: {total?: boolean, index: number}): JSX.Element{
    let {total, index} = props; // Unpack props
    let src: Source = sources[index]; // For readability
    let cells: JSX.Element[] = []; // Initialize table row for this goal

    cells.push(<Cell bold key="label" value={src.label}/>);

    cells.push(
      <Cell key="quantity" value={(total) ? undefined : src.qty}
        // onBlur={() => {saveChanges(changed); changed = false}}
        onChange={total ? undefined : (e) => handleChange(e, index)}
      />
    );
    
    cells.push(
      <td className="read-only" key="select">
        {src.hasSelect && // Render checkbox conditionally
          <Form.Check
            type="checkbox"
            defaultChecked={src.selected}
            onChange={(e) => handleChecked(e, index)}
          />}
      </td>);

    cells.push(<Cell bold key="amount" value={(src.hasSelect && src.selected || !src.hasSelect) ? src.qty * src.mult : 0}/>);
    return <tr>{cells}</tr>;
  }

  return(
    <Table hover>
      <thead>
        <tr>
          <th>Image Placeholder</th>
          <th>Quantity</th>
          <th>Use?</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {table}
      </tbody>
    </Table>
  );
}