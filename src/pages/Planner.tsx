import './Planner.css';
import '../components/container-table/container-table.css';

import {RosterView} from '../components/planner/RosterView';
import {RosterStorageView} from '../components/planner/RosterStorageView';
import {MarketDataView} from '../components/planner/MarketDataView';

import {Tab, Tabs} from 'react-bootstrap';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

export function Planner(){
  return(
    <main>
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
    </main>
  );
}