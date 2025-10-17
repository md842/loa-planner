import './Cell.css';

import {type ReactNode} from 'react';

import Col from 'react-bootstrap/Col';

/** Props interface for Cell. */
interface CellProps{
  bold?: boolean; // If true, the cell uses bold font weight.
  className?: string; // Class names to append to common class name "cell"
  colSpan?: number; // Number of columns that the cell should span (default 1)

  value?: string | number; // read-only value or writeable defaultValue
  controlledValue?: string | number; // State-controlled value

  onBlur?: React.FocusEventHandler<HTMLInputElement>; // Focus out handler
  onChange?: React.ChangeEventHandler<HTMLInputElement>; // Change handler
}

/** Constructs the "Remaining materials" section(s) of the parent table. */
export function Cell(props: CellProps): ReactNode{
  let {bold, className, colSpan, value, controlledValue, onBlur, onChange} = props; // Unpack props

  /* If onChange is defined, the cell is writeable. */
  return(
    <Col
      className={"table-cell " +
        ((bold) ? "bold " : '') +
        ((className) ? className + ' ' : '') +
        ((onChange) ? "writeable" : "read-only")}
      xs={!colSpan ? 1 : colSpan}>
      <input
        className="table-cell input"
        defaultValue={(controlledValue != null) ? undefined : ((onChange) ? value : undefined)
          /* Writeable cells must use defaultValue for user input to be 
            visible when onChange doesn't re-render the table (goal name). */}
        value={(controlledValue != null) ? controlledValue : ((onChange) ? undefined : value)
          /* Read-only cells must use value so they can be updated (totals) */}
        onBlur={onBlur}
        onChange={onChange}
        disabled={!onChange}
      />
    </Col>
  );
}