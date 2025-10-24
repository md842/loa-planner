import {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export default function Header(){
  const [darkMode, setDarkMode] = useState(initDarkMode);

  function initDarkMode(): boolean{ // Dark mode state initializer function
    // Attempt to load saved dark mode setting from local storage
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode){ // Data for dark mode setting exists in local storage
      try{ // JSON.parse() throws exception if storedDarkMode not valid boolean
        return JSON.parse(storedDarkMode); // Use local stored data
      }
      catch(e){ // Error parsing storedDarkMode from string to boolean
        // May occur if local stored data was corrupted or tampered with
        return true; // Default to true (dark mode)
      }
    }
    return true; // If undefined (first visit), default to true (dark mode)
  }

  useEffect(() => {
    // Apply appropriate Bootstrap theme for the value of darkMode
    document.documentElement.setAttribute('data-bs-theme', darkMode ? "dark" : "light");

    // Allows dark mode setting to persist between sessions
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]); // Runs on mount and when darkMode changes

  return(
    <header className="sticky-top">
      <Navbar className="mb-5" bg="dark" data-bs-theme="dark">
        <Container>
          <Nav
            activeKey={'/' + useLocation().pathname.split('/')[1]}
            variant="underline"
          > {/* Highlights active page in nav bar */}
            <Navbar.Brand as={Link} to="/">LOA Planner</Navbar.Brand>
            <Nav.Link as={Link} eventKey="/" to="/">Planner</Nav.Link>
            <Nav.Link as={Link} eventKey="/planned-features" to="/planned-features">Planned Features</Nav.Link>
          </Nav>
          <Button variant="link"
            onClick={() => setDarkMode(prev => !prev)}
          >
            <i className={"fs-2 lh-1 " + // Bootstrap styling
              /* Bootstrap icon determined by dark mode setting;
                 if dark mode, sun icon as "switch to light mode" button,
                 if light mode, moon icon as "switch to dark mode" button. */
              "bi bi-" + (darkMode ? "sun" : "moon") + "-fill"}
            />
          </Button>
        </Container>
      </Navbar>
    </header>
  );
}