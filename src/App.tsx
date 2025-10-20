import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/container-table/container-table.css';

import {useState} from 'react';
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import {Planner} from './pages/Planner';
import {PlannedFeatures} from './pages/PlannedFeatures';
import NoPage from './pages/NoPage'; // 404

import {PlannerTutorial} from './components/tutorials/PlannerTutorial';

import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Layout(){ /* Display the routed main between Header and Footer */
  return(
    <>
      <Header/>
      <Outlet/>
      <Footer/>
    </>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
    {
      index: true,
      element: <Planner/>,
    },
    {
      path: "/planned-features",
      element: <PlannedFeatures/>,
    },
    {
      path: "*",
      element: <NoPage/>,
    }]
  }
]);

// Constant used to determine whether or not to display WelcomeModal
const currentVer = 10; // Represents the current version of LOA Planner

export default function App(){
  const [modalVis, setModalVis] = useState(initVis); // WelcomeModal visibility

  function initVis(): boolean{ // Modal state initializer function
    // prevVer stores the version of LOA Planner that the user last accessed
    const prevVer = localStorage.getItem("prevVer");

    if (prevVer){ // Returning user
      // Check if LOA Planner updated since the user's last visit
      if (Number(prevVer) >= currentVer) // If prev >= current, no update
        return false; // Do not show WelcomeModal
    }
    // Fall through if new user or update occurred since last visit
    return true; // Show WelcomeModal
  }

  /** Displays on first run or after an update to LOA Planner occurs. */
  function WelcomeModal(){
    function dismissModal(){
      /* Sets prevVer to the current version of LOA Planner. WelcomeModal will
         not show again until the next update (or local storage is wiped). */
      localStorage.setItem("prevVer", String(currentVer));
      setModalVis(false); // Close WelcomeModal
    }

    return(
      <Modal show={modalVis} centered size="lg">
        <Modal.Header>
          <Modal.Title>Welcome to LOA Planner!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Version 1.0: Initial Release</Accordion.Header>
              <Accordion.Body>
                <h6>What's new:</h6>
                <p>
                  Implemented Planner with two tabs: "Roster View", and "Roster
                  Storage and Market Data".
                </p>
                <p>
                  Note: On vertical monitors, the "Roster Storage and Market
                  Data" tab is separated into "Roster Storage" and "Market
                  Data" tabs for an improved viewing experience.
                </p>
                <br/>
                <p>Click on any of the items below for an overview.</p>
                <PlannerTutorial/>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={dismissModal}>Dismiss</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return(
    <>
      <WelcomeModal/>
      <RouterProvider router={router}/>
    </>
  )
}
