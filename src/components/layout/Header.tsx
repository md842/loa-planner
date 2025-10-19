import './Header.css';

import {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export default function Header(){
  const [icon, setIcon] = useState("sun"); // Default to dark mode
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  useEffect(() => {
    // Attempt to load saved dark mode setting from local storage
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode){ // Data for dark mode setting exists in local storage
      try{ // JSON.parse() throws exception if storedDarkMode not valid boolean
        setDarkMode(JSON.parse(storedDarkMode)); // Use local stored data
      }
      catch(e){ // Error parsing storedDarkMode from string to boolean
        // May occur if local stored data was corrupted or tampered with
        setDarkMode(true); // Default to true
      }
    }
    // Stick with default if undefined (e.g., first session)
  }, []); // Runs on mount

  useEffect(() => {
    if (darkMode){ // Apply dark mode
      setIcon("sun"); // Set icon to sun as a "switch to light mode" button
      document.documentElement.setAttribute('data-bs-theme', "dark");
    }
    else{ // Apply light mode
      setIcon("moon"); // Set icon to moon as a "switch to dark mode" button
      document.documentElement.setAttribute('data-bs-theme', "light");
    }
    /* Save dark/light mode setting to local storage, allows dark/light mode
       setting to persist between sessions */
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]); // Runs on mount and when darkMode changes

  return(
    <header className="sticky-top">
      <Navbar bg="dark" data-bs-theme="dark">
        <Container>
          <Nav
            activeKey={'/' + useLocation().pathname.split('/')[1]}
            variant="underline"
          > {/* Highlights active page in nav bar */}
            <Navbar.Brand as={Link} to="/">LOA Planner</Navbar.Brand>
            <Nav.Link as={Link} eventKey="/" to="/">Planner</Nav.Link>
            <Nav.Link as={Link} eventKey="/planned-features" to="/planned-features">Planned Features</Nav.Link>
          </Nav>
          <Button
            variant="link"
            onClick={() => setDarkMode(prev => !prev)}
          >
            <i className={"bi bi-" + icon + "-fill"}></i>
          </Button>
        </Container>
      </Navbar>
    </header>
  );
}