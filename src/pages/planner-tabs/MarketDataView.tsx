import {MarketDataTable} from '../../components/planner/tables/MarketDataTable';

import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';

export function MarketDataView(){
	return(
    <main>
      <Container fluid="md">
        <Table className="m-0" hover style={{"--table-color": "#999"} as React.CSSProperties}>
          <thead>
            <tr>
              <th>Market Data</th>
              <th>Market Price</th>
              <th>Use?</th>
              <th>Unit Price</th>
            </tr>
          </thead>
        </Table>
        <MarketDataTable
          title="Abidos Fusion Materials"
          color="#F90"
          mat="fusions"
        />
        <MarketDataTable
          title="Destiny Shards"
          color="#E47"
          mat="shards"
        />
        <MarketDataTable
          title="Destiny Leapstones"
          color="#D36"
          mat="leaps"
        />
        <MarketDataTable
          title="Destiny Destruction Stones"
          color="#F44"
          mat="reds"
        />
        <MarketDataTable
          title="Destiny Guardian Stones"
          color="#27B"
          mat="blues"
        />
        <MarketDataTable
          title="Lava's Breaths"
          color="#F43"
          mat="redSolars"
        />
        <MarketDataTable
          title="Glacier's Breaths"
          color="#28C"
          mat="blueSolars"
        />
      </Container>
    </main>
	);
}