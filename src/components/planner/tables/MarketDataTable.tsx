import {type ReactNode, useEffect, useState} from 'react';

import {SourceRow} from './SourceRow';

import {type Materials, type Source} from '../../core/types';
import {getSources, saveSources, setMarketData, setSourceData} from '../../core/market-data';

import Table from 'react-bootstrap/Table';

/** Props interface for MarketDataTable. */
interface MarketDataTableProps{
  title: string; // Displayed in the top-left corner of the table
  color: string; // The color used for this table
  mat: keyof Materials; // The material associated with this table
}

/** Constructs the market data table. */
export function MarketDataTable(props: MarketDataTableProps): ReactNode{
  let {title, color, mat} = props; // Unpack props

  // Table state variable for materials sources
  const [changed, setChanged] = useState(false);
  const [sources, setSources] = useState(() => getSources(mat));
  const [table, updateTable] = useState([] as ReactNode[]);

  // Update signal handlers
  useEffect(() => {
    setSourceData(mat, sources); // Updates source data
    updateTable(initTable); // Re-renders table
  }, [sources]); // Runs on mount and when sources change

  useEffect(() => {
    if (changed){ // Uncommitted changes are present
      saveSources(mat); // Save roster storage data for specified mat
      setChanged(false); // Signal that changes were committed
    }
  }, [changed]); // Runs when changed changes, does nothing on mount due to initial state false

  function initTable(): ReactNode[]{ // Table state initializer function
    let table: ReactNode[] = []; // Initialize table
    
    for (let i = 0; i < sources.length; i++){ // Build row for each source
      table.push(
        <SourceRow key={sources[i].id}
          // If multiple sources, last source is total
          total={(sources.length > 1) && (i == sources.length - 1)}
          src={sources[i]}
          index={i}
          // Parent component state setters
          setChanged={setChanged}
          setSource={setSource}
        />
      );
    }
    return table;
  }

  /** Updates source srcIndex, source total, and rosterMats. */
  function setSource(srcIndex: number, matIndex: number, qty?: number, selected?: boolean){
    /* MarketDataCard interprets Sources differently from RosterStorageCard.
     * This allows easy reuse of Source and SourceRow at the cost of making
     * this particular function slightly more confusing.
     * 
     * src.qty: Market price (may be for a bundle of materials)
     * src.amt: Unit price (1 material)
     * src.sel: Source is active (same as RosterStorageCard)
     * src.mult: Materials per bundle (divides market price to get unit price)
     * src.div: Exchange rate to tier 4 (multiply unit price of tier 3 mats)
    **/

    // Deep copy target source from state variable
    let src: Source = JSON.parse(JSON.stringify(sources[srcIndex]));

    if (qty != null) // If defined, update src.qty (market price)
      src.qty[0] = qty;
    if (selected != null) // If defined, update src.sel
      src.sel![0] = selected;

    if (src.sel && !src.sel[matIndex]) // Source is inactive
      src.amt[0] = 0; // Set unit price to 0
    else{ // Source is active, calculate new unit price
      let unitPrice: number = src.qty[0]; // Start from src.qty
      if (src.div) // Multiply by divisor (e.g., 5:1 exchange rate 1580 > 1640)
        unitPrice *= src.div;
      if (src.mult) // Divide by multiplier (mats per bundle) to get unit price
        unitPrice /= src.mult[0];
      src.amt[0] = unitPrice; // Update source unit price
    }

    // If >1 source, deep copy "Optimal" source from state variable
    let opt: Source | undefined = (sources.length > 1) ? JSON.parse(JSON.stringify(sources[sources.length - 1])) : undefined;
    if (opt){ // Find new min unit price for this mat
      /* sources is an async state variable and may have an outdated unit price
         if referenced here, so use the locally calculated new unit price as
         initial min (if src is active) and ignore sources[srcIndex]. */
      let min: number = (src.sel![0]) ? src.amt[0] : -1;
      for (let i = 0; i < sources.length - 1; i++){ // Ignore "Optimal" source
        if (i != srcIndex){ // Ignore sources[srcIndex]
          if (sources[i].sel![0]){ // Ignore inactive sources
            if ((min == -1) || // src not active, replace initial min immediately
                (sources[i].amt[0] != 0 && // Source has non-zero unit price
                 sources[i].amt[0] < min)) // Source unit price less than min
              min = sources[i].amt[0]; // Update min with sources[i] unit price
          }
        }
      }
      opt.amt[0] = min; // Update optimal min with min unit price
      
      setSources([ // Update sources state variable
        ...sources.slice(0, srcIndex), // Sources before specified index
        src, // Source being edited
        ...sources.slice(srcIndex + 1, -1), // Sources after specified index
        opt // "Optimal" source
      ]);
      setMarketData(mat, opt.amt[0]); // Update market data
    }
    else{ // If opt is undefined, there is only one source to set
      setSources([src]); // Update sources state variable
      setMarketData(mat, src.amt[0]); // Update market data
    }
  }

  return(
    <Table className="m-0" hover style={{"--table-color": color} as React.CSSProperties}>
      <thead>
        <tr>
          <th colSpan={4}>{title}</th>
        </tr>
      </thead>
      <tbody>
        {table}
      </tbody>
    </Table>
  );
}