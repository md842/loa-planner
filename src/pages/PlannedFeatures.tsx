export function PlannedFeatures(){
  return(
    <main>
      <h5 className="mb-4">Here's a look at features I'm working on, in order of priority:</h5>

      <h6>Calculators (New Page)</h6>
      <p className="mb-4">
        Various calculators, including (but not limited to) customizable raid
        material gold value and raid bonus reward gold efficiency, roster
        income from dailies, Abidos Fusion Material crafting efficiency
        calculator, life skill material auto-balancing calculator for Abidos
        Fusion Material crafting, Mari's Shop gold efficiency, and solo shop
        gold/token efficiency.
      </p>

      <h6>Planner: Focused View (New Tab)</h6>
      <p className="mb-4">
        A Planner view that focuses on one character and displays additional
        information, such as the ability to specify a goal date and project the
        character's owned and remaining materials up to that date.
      </p>

      <h6>Activity Checklist (New Page)</h6>
      <p className="mb-4">
        Provides a checklist for raids and other daily/weekly activities that
        will integrate into Focused View (possibly even Roster View using
        end-of-week projection) with projected gold and material income.
      </p>

      <h6>Data Import/Export (General Feature)</h6>
      <p className="mb-4">
        Allows for importing/exporting LOA Planner data as a JSON file to
        migrate between machines. Could possibly be replaced by user accounts.
      </p>

      <br/>

      <h5 className="mb-4">Here's a look at features I'm considering, in no particular order:</h5>

      <h6>Automatic Market Data/Market API? (General Feature)</h6>
      <p className="mb-4">
        Market Data will populate automatically rather than requiring manual
        entry/updates. May even provide a market API depending on popularity
        and demand, but this is hard to say for now due to uncertainty around
        implementation details at this time.
      </p>

      <h6>User Accounts (General Feature)</h6>
      <p className="mb-4">
        User accounts would store LOA Planner data server-side rather than
        relying on local browser storage, which would improve convenience of
        use across multiple devices and allow for tracking of multiple rosters
        without having to use different browsers or devices.
      </p>
    </main>
  );
}