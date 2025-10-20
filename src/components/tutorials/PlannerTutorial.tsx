import {type ReactNode} from 'react';

import Accordion from 'react-bootstrap/Accordion';

export function PlannerTutorial(): ReactNode{
  return(
    <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0">
        <Accordion.Header>Planner: Overview</Accordion.Header>
        <Accordion.Body>
          <p>
            The Planner section of LOA Planner is intended to be an extension
            of (not a replacement for) the functionality of&nbsp;
            <a
              href="https://maxroll.gg/"
              target="_blank"
            >
              Maxroll
            </a>'s&nbsp;
            <a
              href="https://maxroll.gg/lost-ark/upgrade-calculator"
              target="_blank"
            >
              Material Upgrade Calculator Tool for Lost Ark.
            </a>
          </p>
          <h6 className="my-4">Why use LOA Planner?</h6>
          <p>
            LOA Planner is the ultimate tool for tracking the progression of
            your entire roster.
          </p>
          <p>
            Each character can store individual bound resources and multiple
            progression goals, and see how far they are from achieving their
            goals using only their bound resources <i>or</i> all available
            resources.
          </p>
          <p>
            Custom roster-wide progression goals may be set by aggregating
            goals and resources from multiple characters, resulting in a
            comprehensive picture of your entire roster's path forward (e.g.,
            how far am I from having an entire roster of 1720 characters?).
          </p>
          <p>
            LOA Planner additionally provides a more convenient way to
            determine total materials available to each character within your
            roster without having to manually calculate material quantities
            within unopened chests/pouches in your roster storage.
          </p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Planner: Roster View</Accordion.Header>
        <Accordion.Body>
          <h6 className="mb-4">Character Goals</h6>
          <p>
            The "Roster View" tab allows for adding characters and managing
            their individual bound resources and progression goals.
          </p>
          <p>
            The "Add Character" button creates a character card. Character
            goals may be added, reordered, and deleted via the "Configure
            Goals" button on each character card. Custom goal names and
            resource values may be input directly into the character card via
            the input fields (indicated by lighter backgrounds).
          </p>
          <h6 className="my-4">Roster Goals</h6>
          <p>
            The "Roster View" tab additionally allows for adding roster-wide
            progression goals.
          </p>
          <p>
            Roster goals may be added, reordered, and deleted via the
            "Configure Roster Goals" button on the roster goals card at the top
            or bottom of the "Roster View" tab. Custom roster goal names may be
            input directly into the roster goals card via the input field
            (indicated by lighter background).
          </p>
          <p>
            Editing roster goal values must be done via the "Configure Roster
            Goals" menu by clicking the edit button on the desired roster goal
            and selecting the character goals to be included in that roster
            goal from each character.
          </p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>Planner: Roster Storage</Accordion.Header>
        <Accordion.Body>
          <p>
            The "Roster Storage" tab is a convenient tool for tracking total
            materials available to your roster by aggregating multiple sources,
            including tradable materials, daily chests, and other unopened
            chests/pouches in your roster storage, for you so you don't have to
            manually calculate each total.
          </p>
          <p>
            For materials other than Silver and Gold, material sources may be
            added, reordered, and deleted via the "Configure Sources" button on
            the material's Roster Storage table. Preset material sources are
            provided, but custom material sources may also be added.
          </p>
          <p>
            Some material sources (generally tradable sources), display a
            checkbox in the "Use?" column of their Roster Storage table. This
            allows the source to be quickly added or removed from consideration
            in the total amount, and is useful when you would rather sell your
            tradable materials or are unsure if you want to use them, but would
            still like to track the quantity that you own.
          </p>
          <p>
            Some material sources display a numeric input field in the "Use?"
            column of their Roster Storage table. This indicates that the
            material source is a selection chest, and the "Use?" quantity
            allows you to specify how you plan to open your selection chests,
            whether you'll make the same selection for all of them or open a
            mix of each selection.
          </p>
          <p>
            On horizontal monitors, "Roster Storage" displays side by side with
            "Market Data".
          </p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="3">
        <Accordion.Header>Planner: Market Data</Accordion.Header>
        <Accordion.Body>
          <p>
            The "Market Data" tab allows data entry of market prices for
            various honing materials. Market data is used to calculate total
            gold values of goal materials, owned materials, remaining
            materials, etc. 
          </p>
          <p>
            For honing materials that come in various
            bundle sizes or have exchanges available, the optimal price for the
            honing material will be automatically calculated.
          </p>
          <p>
            If desired, a market item may be excluded from consideration using
            the checkboxes in the "Use?" column of the market data table.
          </p>
          <p>
            On horizontal monitors, "Market Data" displays side by side with
            "Roster Storage".
          </p>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}
