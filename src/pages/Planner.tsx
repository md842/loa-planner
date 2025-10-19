import './Planner.css';

import {createContext, useEffect, useState} from 'react';

import {RosterView} from '../components/planner/RosterView';
import {RosterStorageView} from '../components/planner/RosterStorageView';
import {MarketDataView} from '../components/planner/MarketDataView';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import {Tab, Tabs} from 'react-bootstrap';

// Constants
const defaultTabKey: string = "roster-view";
const verticalMonitorWidthThreshold: number = 1200;

/* Update signals used to synchronize RosterView with the RosterStorageView and
   MarketDataView components upon changes to their underlying data. */
interface PlannerSyncSignals{
  marketDataChanged: boolean[];
  setMarketDataChanged: (data: boolean[]) => void;
  rosterMatsChanged: boolean[];
  setRosterMatsChanged: (data: boolean[]) => void;
}
export const PlannerSyncContext = createContext({} as PlannerSyncSignals);

export function Planner(){
  // Planner tab state variable
  const [activeKey, setActiveKey] = useState(defaultTabKey);
  /* If true, Roster Storage and Market Data are rendered as separate tabs.
     If false, they are rendered as a combined tab. */
  const [verticalMonitor, setVerticalMonitor] = useState(window.innerWidth <= verticalMonitorWidthThreshold);

  function updateActiveKeyOnResize(): string{ // Async state updater function
    if (activeKey == "market-data")
      // Market Data combines into Roster Storage, fallback to Roster Storage
      return "roster-storage";
    return activeKey; // If Market Data is not the active tab, do nothing
  }

  useEffect(() => { // Adds an event listener for window resizing
    const onResize = () => {
      let isVerticalMonitor: boolean = window.innerWidth <= verticalMonitorWidthThreshold;
      if (!isVerticalMonitor) // Resizing to horizontal monitor
        /* Market Data tab will no longer display, so ensure activeKey is not
           market-data. Must be done in an asynchronous state updater function
           in order to access the correct value of activeKey. */
        setActiveKey(updateActiveKeyOnResize);
      // Set verticalMonitor state to determine which tabs are rendered
      setVerticalMonitor(isVerticalMonitor);
    }
    window.addEventListener("resize", onResize);
    
    return() => { // useEffect cleanup; removes event listener
      window.removeEventListener("resize", onResize);
    }
  }, []); // Runs on mount

  // Update signal state variables
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
        <Tabs
          activeKey={activeKey}
          onSelect={(key) => setActiveKey(key ? key : defaultTabKey)}
          className="planner-tabs mb-5" justify
        >
          <Tab eventKey="roster-view" title="Roster View">
            <RosterView/>
          </Tab>
          {!verticalMonitor && // Render combined tab on horizontal monitors
            <Tab eventKey="roster-storage" title="Roster Storage and Market Data">
              <Container fluid>
                <Row xl={1} xxl={2}>
                  <Col className="mb-3" xl={12} xxl={8}>
                    <h3 className="mb-3">Roster Storage</h3>
                    <RosterStorageView/>
                  </Col>
                  <Col className="mx-auto" xl={8} xxl={4}>
                    <h3 className="mb-3">Market Data</h3>
                    <MarketDataView/>
                  </Col>
                </Row>
              </Container>
            </Tab>
          }
          {verticalMonitor && // Render separate tabs on vertical monitors
            <Tab eventKey="roster-storage" title="Roster Storage">
              <RosterStorageView/>
            </Tab>
          }
          {verticalMonitor && // Render separate tabs on vertical monitors
            <Tab eventKey="market-data" title="Market Data">
              <MarketDataView/>
            </Tab>
          }
        </Tabs>
      </PlannerSyncContext>
    </main>
  );
}