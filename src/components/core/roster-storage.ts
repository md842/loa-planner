import {type Materials} from './types';

export function loadRosterMats(): Materials{
  // Uses placeholder values for now.
  let rosterMats: Materials = {
    silver: 642379983,
    gold: 6944557,
    shards: 2632000,
    fusions: 11873,
    reds: 80569,
    blues: 1063845,
    leaps: 25780,
    redSolars: 77,
    blueSolars: 3912
  };
  return rosterMats;
}