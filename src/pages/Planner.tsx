import './Planner.css';
import '../components/planner/tables/common.css';

import {RosterView} from './planner-tabs/RosterView';
import {RosterStorageView} from './planner-tabs/RosterStorageView';
import {MarketDataView} from './planner-tabs/MarketDataView';

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