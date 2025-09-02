import {type Materials} from './types';

export function loadRosterMats(): Materials{
  // Uses placeholder values for now.
  let rosterMats: Materials = {
    silver: 612320126,
    gold: 12710281,
    shards: 2503000,
    fusions: 11723,
    reds: 342964,
    blues: 931705,
    leaps: 23875,
    redSolars: 13,
    blueSolars: 3650
  };
  return rosterMats;
}