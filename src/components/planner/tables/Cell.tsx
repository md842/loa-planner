import './Cell.css';

import {type JSX} from 'react';

/** Props interface for Cell. */
interface CellProps{
  bold?: boolean; // If true, the cell uses bold font weight.
  value: string | number | undefined; // read-only value or writeable defaultValue
  className?: string; // Class names to append to common class name "cell"
  onBlur?: React.FocusEventHandler<HTMLInputElement>; // Focus out handler
  onChange?: React.ChangeEventHandler<HTMLInputElement>; // Change handler
}

/** Constructs the "Remaining materials" section(s) of the parent table. */
export function Cell(props: CellProps): JSX.Element{
  let {bold, value, className, onBlur, onChange} = props; // Unpack props

  /* If onChange is defined, the cell is writeable. */
  return(
    <td className={(onChange) ? "writeable" : "read-only"}>
      <input
        className={"cell" + ((bold) ? " bold" : "") + ((className) ? " " + className : "")}
        defaultValue={(onChange) ? value : undefined
          /* Writeable cells must use defaultValue for user input to be 
             visible when onChange doesn't re-render the table (goal name). */}
        value={(onChange) ? undefined : value
          /* Read-only cells must use value so they can be updated (totals) */}
        onBlur={onBlur}
        onChange={onChange}
        disabled={!onChange}
      />
    </td>
  );
}