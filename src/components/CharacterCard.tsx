import './CharacterCard.css';

import gold from '../assets/gold.png';
import silver from '../assets/silver.png';
import t4_blue from '../assets/t4_blue.png';
import t4_bluesolar from '../assets/t4_bluesolar.png';
import t4_fusion from '../assets/t4_fusion.png';
//import t4_gem from '../assets/t4_gem.png';
import t4_leap from '../assets/t4_leap.png';
import t4_red from '../assets/t4_red.png';
import t4_redsolar from '../assets/t4_redsolar.png';
import t4_shard from '../assets/t4_shard.png';

import type { JSX } from 'react';
import Table from 'react-bootstrap/Table';

/** Props interface for CharacterCard(). */
interface Character{
  name: string; // Name of character.
  ilvl: string; // Item level of character.
  class: string; // Class of character.
  goals: Array<Goal>; // Array of goals belonging to character.
}

/** Interface for character goal data. */
export interface Goal{
  name: string;
  silver: number;
  gold: number;
  shards: number;
  fusions: number;
  reds: number;
  blues: number;
  leaps: number;
  redsolars: number;
  bluesolars: number;
}

export function CharacterCard(params: Character): JSX.Element{
  let goals = new Array<JSX.Element>;
  let total = {name: "Total", silver: 0, gold: 0, shards: 0, fusions: 0, reds: 0, blues: 0, leaps: 0, redsolars: 0, bluesolars: 0} as Goal;

  params.goals.forEach((goal) => { // For each goal the character has:
    // TODO: See if there is a more elegant way to do this...
    total.silver += goal.silver;
    total.gold += goal.gold;
    total.shards += goal.shards;
    total.fusions += goal.fusions;
    total.reds += goal.reds;
    total.blues += goal.blues;
    total.leaps += goal.leaps;
    total.redsolars += goal.redsolars;
    total.bluesolars += goal.bluesolars;

    // TODO: and this...
    // TODO: Calculate value using market data once implemented.
    goals.push( // Create table row for the current goal
      <tr>
        <td><input className="invis-input" defaultValue={goal.name}/></td>
        <td><b>Placeholder</b></td>
        <td><input className="invis-input" defaultValue={goal.silver}/></td>
        <td><input className="invis-input" defaultValue={goal.gold}/></td>
        <td><input className="invis-input" defaultValue={goal.shards}/></td>
        <td><input className="invis-input" defaultValue={goal.fusions}/></td>
        <td><input className="invis-input" defaultValue={goal.reds}/></td>
        <td><input className="invis-input" defaultValue={goal.blues}/></td>
        <td><input className="invis-input" defaultValue={goal.leaps}/></td>
        <td><input className="invis-input" defaultValue={goal.redsolars}/></td>
        <td><input className="invis-input" defaultValue={goal.bluesolars}/></td>
      </tr>
    );
  });

  // TODO: and this...
  goals.push( // At the end, create table row for the total of all goals
    <tr>
      <td><b>{total.name}</b></td>
      <td><b>Placeholder</b></td>
      <td><b>{total.silver}</b></td>
      <td><b>{total.gold}</b></td>
      <td><b>{total.shards}</b></td>
      <td><b>{total.fusions}</b></td>
      <td><b>{total.reds}</b></td>
      <td><b>{total.blues}</b></td>
      <td><b>{total.leaps}</b></td>
      <td><b>{total.redsolars}</b></td>
      <td><b>{total.bluesolars}</b></td>
    </tr>
  );

  return(
    <>
      <p>{params.name} - {params.ilvl} {params.class}</p>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Goal Name</th>
            <th>Gold Value</th>
            <th><img src={silver}/></th>
            <th><img src={gold}/></th>
            <th><img src={t4_shard}/></th>
            <th><img src={t4_fusion}/></th>
            <th><img src={t4_red}/></th>
            <th><img src={t4_blue}/></th>
            <th><img src={t4_leap}/></th>
            <th><img src={t4_redsolar}/></th>
            <th><img src={t4_bluesolar}/></th>
          </tr>
        </thead>
        <tbody>
          {goals /* Display unpacked goals */}
        </tbody>
      </Table>
    </>
  );
}