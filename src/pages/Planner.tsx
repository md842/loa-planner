import './Planner.css';
import '../components/container-table/container-table.css';

import {createContext, useState} from 'react';

import {RosterView} from '../components/planner/RosterView';
import {RosterStorageView} from '../components/planner/RosterStorageView';
import {MarketDataView} from '../components/planner/MarketDataView';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import {Tab, Tabs} from 'react-bootstrap';

interface PlannerSyncSignals{
  marketDataChanged: boolean[];
  setMarketDataChanged: (data: boolean[]) => void;
  rosterMatsChanged: boolean[];
  setRosterMatsChanged: (data: boolean[]) => void;
}

export const PlannerSyncContext = createContext({} as PlannerSyncSignals);

export function Planner(){
  const [marketDataChanged, setMarketDataChanged] = useState([false]);
  const [rosterMatsChanged, setRosterMatsChanged] = useState([false]);

  return(
    <main>
      <PlannerSyncContext value={
        {
          marketDataChanged: marketDataChanged,
          setMarketDataChanged: setMarketDataChanged,
          rosterMatsChanged: rosterMatsChanged,
          setRosterMatsChanged: setRosterMatsChanged
        } as PlannerSyncSignals}
      >
        <Tabs defaultActiveKey="roster-view" className="planner-tabs mb-5" justify>
          <Tab eventKey="roster-view" title="Roster View">
            <RosterView/>
          </Tab>
          <Tab eventKey="roster-storage" title="Roster Storage and Market Data">
            <Container fluid>
              <Row xl={1} xxl={2}>
                <Col xl={12} xxl={8}>
                  <RosterStorageView/>
                </Col>
                <Col xl={12} xxl={4}>
                  <MarketDataView/>
                </Col>
              </Row>
            </Container>
          </Tab>
        </Tabs>
      </PlannerSyncContext>
    </main>
  );
}