import {type Materials} from './types';

export function loadRosterMats(): Materials{
  // Uses placeholder values for now.
  let rosterMats: Materials = {
    silver: 645120369,
    gold: 3687289,
    shards: 2652000,
    fusions: 11873,
    reds: 80569,
    blues: 1063845,
    leaps: 25780,
    redSolars: 77,
    blueSolars: 3957
  };
  return rosterMats;
}