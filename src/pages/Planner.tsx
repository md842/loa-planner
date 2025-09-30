import './Planner.css';
import '../components/planner/tables/common.css';

import {RosterView} from './planner-tabs/RosterView';
import {RosterStorageView} from './planner-tabs/RosterStorageView';
import {MarketDataView} from './planner-tabs/MarketDataView';

import {Tab, Tabs} from 'react-bootstrap';

export function Planner(){
  return (
    <Tabs defaultActiveKey="roster-view" className="planner-tabs mb-5" justify>
      <Tab eventKey="roster-view" title="Roster View">
        <RosterView/>
      </Tab>
      <Tab eventKey="roster-storage" title="Roster Storage">
        <RosterStorageView/>
      </Tab>
      <Tab eventKey="market-data" title="Market Data">
        <MarketDataView/>
      </Tab>
    </Tabs>
  );
}